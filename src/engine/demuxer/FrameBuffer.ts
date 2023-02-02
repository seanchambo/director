import { VideoMediaObject } from '../../model';
import { MP4Demuxer } from './MP4Demuxer';

interface FrameBufferOpts {
	videoObject: VideoMediaObject;
}

export interface AudioBufferData {
	config: {
		length: number;
		sampleRate: number;
		numberOfChannels: number;
	};
	channelData: Array<Array<[Uint8Array, number]>>;
}

const intersect = (fromA: number, toA: number, fromB: number, toB: number) => {
	return fromA <= toB && fromB <= toA
}

export class FrameBuffer {
	demuxer: MP4Demuxer;
	keyFrameChunks: Map<number, EncodedVideoChunk[]>;
	keyFrames: [number, number][] = [];
	audioChunks: EncodedAudioChunk[] = [];
	frames: Map<number, ImageBitmap>;
	videoObject: VideoMediaObject;
	videoConfig: VideoDecoderConfig | null = null;
	audioConfig: AudioDecoderConfig | null = null;
	audioBufferData: AudioBufferData | null = null;
	fps = 0;
	frameDuration = 0;

	currentDecodedKeyFrames: Set<number> = new Set();

	constructor({ videoObject }: FrameBufferOpts) {
		this.demuxer = new MP4Demuxer(videoObject.src);
		this.videoObject = videoObject;
		this.frames = new Map();
		this.keyFrameChunks = new Map();
	}

	async initialize() {
		const videoConfig = await this.demuxer.getVideoConfig();
		const audioConfig = await this.demuxer.getAudioConfig()
		this.fps = videoConfig.fps;
		this.frameDuration = videoConfig.frameDuration;

		this.videoConfig = videoConfig;
		this.audioConfig = audioConfig;

		await this.demuxVideoSamples();
		await this.demuxAudioSamples();

		await this.decodeAudio();
	}

	getFrame(frame: number, movieFPS: number) {
		const ratio = this.fps / movieFPS;
		const relativeFrame = Math.floor((frame - this.videoObject.start) * ratio);

		return this.frames.get(relativeFrame);
	}

	async bufferFrom(frame: number, movieFPS: number) {
		const ratio = this.fps / movieFPS;
		const relativeFrame = Math.floor((frame - this.videoObject.start) * ratio);

		const lookahead = relativeFrame + 600;
		const lookback = relativeFrame - 600;

		const keyFrames = this.getKeyFramesBetween(lookback, lookahead);

		const current = new Set(this.currentDecodedKeyFrames);
		this.currentDecodedKeyFrames = new Set(keyFrames);

		const toDecode: number[] = [];

		for (const keyFrame of keyFrames) {
			if (current.has(keyFrame)) {
				current.delete(keyFrame);
			} else {
				toDecode.push(keyFrame)
			}
		}

		// Release frames not needed
		for (const keyFrame of current) {
			const chunks = this.keyFrameChunks.get(keyFrame);
			if (chunks) {
				for (const chunk of chunks) {
					const frame = this.frames.get(chunk.timestamp / this.frameDuration);
					if (frame) {
						frame.close()
						this.frames.delete(chunk.timestamp / this.frameDuration);
					}
				}
			}
		}

		for (const keyFrame of toDecode) {
			await this.decodeKeyFrame(keyFrame);
		}
	}

	private decodeAudio = async () => {
		if (!this.audioConfig) { throw new Error('initialize before decoding audio') };

		let numOfFrames = 0;
		const numOfChannels = this.audioConfig.numberOfChannels;
		const sampleRate = this.audioConfig.sampleRate;

		console.log(sampleRate)

		const offsets = Array(numOfChannels).fill(0);
		const sizes = Array(numOfChannels).fill(0);
		const chunkBuffers: Array<Array<[Uint8Array, number]>> = [];

		for (let i = 0; i < numOfChannels; i++) {
			chunkBuffers.push([]);
		}

		const decoder = new AudioDecoder({
			output: (output) => {
				numOfFrames += output.numberOfFrames;
				// console.log(output.sampleRate, output.timestamp);

				for (let i = 0; i < numOfChannels; i++) {

					const outputBuffer = new Uint8Array(output.allocationSize({ planeIndex: i }));
					output.copyTo(outputBuffer, { planeIndex: i });

					chunkBuffers[i].push([outputBuffer, output.timestamp]);
					offsets[i] += outputBuffer.byteLength;
					sizes[i] += outputBuffer.byteLength;
				}

				output.close();
			},
			error: (e) => {
				console.error(e)
			}
		})

		decoder.configure(this.audioConfig!);

		for (const chunk of this.audioChunks) {
			decoder.decode(chunk);
		}

		await decoder.flush();
		decoder.close();

		this.audioBufferData = {
			config: {
				length: numOfFrames,
				sampleRate,
				numberOfChannels: numOfChannels
			},
			channelData: chunkBuffers,
		}
	}

	private decodeKeyFrame = async (keyFrame: number) => {
		if (this.videoConfig === null) { throw new Error('initialize before buffering'); }

		const chunks = this.keyFrameChunks.get(keyFrame);
		if (!chunks) return;

		const decoder = new VideoDecoder({
			output: async (frame) => {
				const bitmap = await createImageBitmap(frame);
				if (frame.timestamp === null) return;

				this.frames.set(frame.timestamp / this.frameDuration, bitmap);
				frame.close();
			},
			error: (e) => {
				console.error(e);
			}
		})

		decoder.configure(this.videoConfig)

		for (const chunk of chunks) {
			decoder.decode(chunk);
		}

		await decoder.flush();
		decoder.close();
	}

	private getKeyFramesBetween = (from: number, to: number) => {
		const keyFrames = [];

		for (const keyFrame of this.keyFrames) {
			if (intersect(from, to, keyFrame[0], keyFrame[1])) {
				keyFrames.push(keyFrame[0]);
			}

			if (keyFrame[0] > to) {
				break;
			}
		}

		return keyFrames;
	}

	private demuxAudioSamples = () => {
		return new Promise<void>((resolve) => {
			this.demuxer.startAudio((chunks, last) => {
				this.audioChunks.push(...chunks);
				if (last) resolve();
			})
		})
	}

	private demuxVideoSamples = () => {
		return new Promise<void>((resolve) => {
			this.demuxer.startVideo((keyFrameChunks, last) => {
				for (const keyFrameChunk of keyFrameChunks) {
					const start = keyFrameChunk[0].timestamp / this.frameDuration;
					const lastChunk = keyFrameChunk[keyFrameChunk.length - 1];
					const end = lastChunk.timestamp / this.frameDuration;

					this.keyFrameChunks.set(start, keyFrameChunk);
					this.keyFrames.push([start, end]);
				}

				if (last) resolve();
			})
		})
	}
}
