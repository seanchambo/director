import * as MP4Box from 'mp4box';

class MP4Source {
	file: MP4Box.MP4File;
	info: MP4Box.MP4Info | null;
	_info_resolver: ((info: MP4Box.MP4Info) => void) | null;
	_onVideoKeyFrameChunks: (keyFrameChunks: EncodedVideoChunk[][], sampleNum: number) => void;
	_onAudioChunks: (chunks: EncodedAudioChunk[], sampleNum: number) => void;

	constructor(uri: string) {
		this.file = MP4Box.createFile();
		this.file.onError = console.error.bind(console);
		this.file.onReady = this.onReady.bind(this);
		this.file.onSamples = this.onSamples.bind(this);
		this._onVideoKeyFrameChunks = () => null;
		this._onAudioChunks = () => null;

		fetch(uri).then(response => {
			if (!response.body) return null;

			const reader = response.body.getReader();
			let offset = 0;
			const mp4File = this.file;

			const appendBuffers = ({ done, value }: ReadableStreamDefaultReadResult<Uint8Array>): any => {
				if (done) {
					mp4File.flush();
					return;
				}

				if (!value) {
					return
				}

				const buf = value.buffer as MP4Box.MP4ArrayBuffer;
				buf.fileStart = offset;

				offset += buf.byteLength;

				mp4File.appendBuffer(buf);

				return reader.read().then(appendBuffers);
			}

			return reader.read().then(appendBuffers);
		})

		this.info = null;
		this._info_resolver = null;
	}

	onReady(info: MP4Box.MP4Info) {
		// TODO: Generate configuration changes.
		this.info = info;

		if (this._info_resolver) {
			this._info_resolver(info);
			this._info_resolver = null;
		}
	}

	getInfo(): Promise<MP4Box.MP4Info> {
		if (this.info)
			return Promise.resolve(this.info);

		return new Promise((resolver) => { this._info_resolver = resolver; });
	}

	getAvccBox() {
		for (const trak of this.file.moov.traks) {
			if (trak.mdia.minf.stbl.stsd.entries[0].avcC) {
				return trak.mdia.minf.stbl.stsd.entries[0].avcC
			}
		}

		return null;
	}

	startVideo(track: MP4Box.MP4VideoTrack, onVideoKeyFrameChunks: (keyFrameChunks: EncodedVideoChunk[][], sampleNum: number) => void) {
		this._onVideoKeyFrameChunks = onVideoKeyFrameChunks;
		this.file.setExtractionOptions(track.id);
		this.file.start();
	}

	startAudio(track: MP4Box.MP4AudioTrack, onAudioChunks: (chunks: EncodedAudioChunk[], sampleNum: number) => void) {
		this._onAudioChunks = onAudioChunks;
		this.file.setExtractionOptions(track.id);
		this.file.start();
	}

	onSamples(track_id: number, ref: any, samples: MP4Box.MP4Sample[]) {
		const track = this.info?.tracks.find(track => track.id === track_id);
		if (!track) return;

		if (track.type === 'video') {
			this.handleVideoSamples(samples);
		} else {
			this.handleAudioSamples(samples);
		}
	}

	private handleAudioSamples(samples: MP4Box.MP4Sample[]) {
		const chunks: EncodedAudioChunk[] = []
		let lastSampleNum = 0;

		for (const sample of samples) {
			const type = sample.is_sync ? "key" : "delta";

			const chunk = new EncodedAudioChunk({
				type,
				timestamp: sample.cts,
				duration: sample.duration,
				data: sample.data,
			});

			lastSampleNum = sample.number;
			chunks.push(chunk);
		}

		this._onAudioChunks(chunks, lastSampleNum);
	}

	private handleVideoSamples(samples: MP4Box.MP4Sample[]) {
		const keyFrames: EncodedVideoChunk[][] = []
		let keyFrameChunks: EncodedVideoChunk[] | null = null;
		let lastSampleNum = 0;

		for (const sample of samples) {
			const type = sample.is_sync ? "key" : "delta";

			if (type === 'key') {
				if (keyFrameChunks) {
					keyFrames.push(keyFrameChunks);
				}
				keyFrameChunks = [];
			}

			const chunk = new EncodedVideoChunk({
				type: type,
				timestamp: sample.cts,
				duration: sample.duration,
				data: sample.data
			});

			keyFrameChunks?.push(chunk);
			lastSampleNum = sample.number;
		}

		if (keyFrameChunks) {
			keyFrames.push(keyFrameChunks)
		}

		this._onVideoKeyFrameChunks(keyFrames, lastSampleNum);
	}
}

class Writer {
	data: Uint8Array;
	idx: number;
	size: number;

	constructor(size: number) {
		this.data = new Uint8Array(size);
		this.idx = 0;
		this.size = size;
	}

	getData() {
		if (this.idx != this.size)
			throw "Mismatch between size reserved and sized used"

		return this.data.slice(0, this.idx);
	}

	writeUint8(value: number) {
		this.data.set([value], this.idx);
		this.idx++;
	}

	writeUint16(value: number) {
		// TODO: find a more elegant solution to endianess.
		const arr = new Uint16Array(1);
		arr[0] = value;
		const buffer = new Uint8Array(arr.buffer);
		this.data.set([buffer[1], buffer[0]], this.idx);
		this.idx += 2;
	}

	writeUint8Array(value: Uint8Array) {
		this.data.set(value, this.idx);
		this.idx += value.length;
	}
}

export class MP4Demuxer {
	source: MP4Source;
	videoTrack: MP4Box.MP4VideoTrack | null;
	audioTrack: MP4Box.MP4AudioTrack | null;

	constructor(uri: string) {
		this.source = new MP4Source(uri);
		this.videoTrack = null;
		this.audioTrack = null;
	}

	getExtradata(avccBox: any) {
		let i;
		let size = 7;
		for (i = 0; i < avccBox.SPS.length; i++) {
			// nalu length is encoded as a uint16.
			size += 2 + avccBox.SPS[i].length;
		}
		for (i = 0; i < avccBox.PPS.length; i++) {
			// nalu length is encoded as a uint16.
			size += 2 + avccBox.PPS[i].length;
		}

		const writer = new Writer(size);

		writer.writeUint8(avccBox.configurationVersion);
		writer.writeUint8(avccBox.AVCProfileIndication);
		writer.writeUint8(avccBox.profile_compatibility);
		writer.writeUint8(avccBox.AVCLevelIndication);
		writer.writeUint8(avccBox.lengthSizeMinusOne + (63 << 2));

		writer.writeUint8(avccBox.nb_SPS_nalus + (7 << 5));
		for (i = 0; i < avccBox.SPS.length; i++) {
			writer.writeUint16(avccBox.SPS[i].length);
			writer.writeUint8Array(avccBox.SPS[i].nalu);
		}

		writer.writeUint8(avccBox.nb_PPS_nalus);
		for (i = 0; i < avccBox.PPS.length; i++) {
			writer.writeUint16(avccBox.PPS[i].length);
			writer.writeUint8Array(avccBox.PPS[i].nalu);
		}

		return writer.getData();
	}

	async getVideoConfig() {
		const info = await this.source.getInfo();
		this.videoTrack = this.findVideoTrack(info);

		const extradata = this.getExtradata(this.source.getAvccBox());

		const frameDuration = this.videoTrack.samples_duration / this.videoTrack.nb_samples;
		const fps = Math.round(this.videoTrack.timescale / frameDuration);

		const config = {
			codec: this.videoTrack.codec,
			codedHeight: this.videoTrack.track_height,
			codedWidth: this.videoTrack.track_width,
			description: extradata,
			fps,
			frameDuration,
		}

		return config;
	}

	async getAudioConfig() {
		const info = await this.source.getInfo();
		this.audioTrack = this.findAudioTrack(info);

		const config = {
			codec: this.audioTrack.codec,
			sampleRate: this.audioTrack.audio.sample_rate,
			numberOfChannels: this.audioTrack.audio.channel_count,
		}

		return config;
	}

	startVideo(onVideKeyFrameChunks: (keyFrameChunks: EncodedVideoChunk[][], last: boolean) => void) {
		if (this.videoTrack) {
			const handler = (keyFrameChunks: EncodedVideoChunk[][], sampleNum: number) => {
				if (sampleNum + 1 === this.videoTrack!.nb_samples) {
					return onVideKeyFrameChunks(keyFrameChunks, true);
				}

				onVideKeyFrameChunks(keyFrameChunks, false);
			}

			this.source.startVideo(this.videoTrack, handler);
		} else {
			onVideKeyFrameChunks([], true);
		}
	}

	startAudio(onAudioChunks: (chunks: EncodedAudioChunk[], last: boolean) => void) {
		if (this.audioTrack) {
			const handler = (chunks: EncodedAudioChunk[], sampleNum: number) => {
				if (sampleNum + 1 === this.audioTrack!.nb_samples) {
					return onAudioChunks(chunks, true);
				}

				onAudioChunks(chunks, false);
			}

			this.source.startAudio(this.audioTrack, handler);
		} else {
			onAudioChunks([], true);
		}
	}

	private findVideoTrack(info: MP4Box.MP4Info): MP4Box.MP4VideoTrack {
		return info.tracks.find((track) => track.type === 'video') as MP4Box.MP4VideoTrack;
	}

	private findAudioTrack(info: MP4Box.MP4Info): MP4Box.MP4AudioTrack {
		return info.tracks.find((track) => track.type === 'audio') as MP4Box.MP4AudioTrack;
	}
}
