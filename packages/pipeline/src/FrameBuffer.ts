import { VideoMediaObject } from '@director/model';
import { MP4Demuxer } from './MP4Demuxer';

interface FrameBufferOpts {
	videoObject: VideoMediaObject;
}

const intersect = (fromA: number, toA: number, fromB: number, toB: number) => {
	return fromA <= toB && fromB <= toA
}

export class FrameBuffer {
	demuxer: MP4Demuxer;
	keyFrameChunks: Map<number, EncodedVideoChunk[]>;
	keyFrames: [number, number][] = [];
	frames: Map<number, ImageBitmap>;
	videoObject: VideoMediaObject;
	config: VideoDecoderConfig | null = null;
	fps: number = 0;

	currentDecodedKeyFrames: Set<number> = new Set();

	constructor({ videoObject }: FrameBufferOpts) {
		this.demuxer = new MP4Demuxer(videoObject.src);
		this.videoObject = videoObject;
		this.frames = new Map();
		this.keyFrameChunks = new Map();
	}

	async initialize() {
		const config = await this.demuxer.getConfig();
		this.fps = config.fps;
		this.config = config;
		await new Promise<void>((resolve) => {
			this.demuxer.start((keyFrameChunks, last) => {
				for (const keyFrameChunk of keyFrameChunks) {
					const start = keyFrameChunk[0].timestamp;
					const lastChunk = keyFrameChunk[keyFrameChunk.length - 1]!;
					const end = lastChunk.timestamp;

					this.keyFrameChunks.set(start, keyFrameChunk);
					this.keyFrames.push([start, end]);
				}

				if (last) resolve();
			})
		})
	}

	getFrame(frame: number, movieFPS: number) {
		const ratio = this.fps / movieFPS;
		const relativeFrame = Math.floor((frame - this.videoObject.start) * ratio);

		return this.frames.get(relativeFrame);
	}

	async bufferFrom(frame: number, movieFPS: number) {
		if (this.config === null) { throw new Error('initialize before buffering'); }

		const ratio = this.fps / movieFPS;
		const relativeFrame = Math.floor((frame - this.videoObject.start) * ratio);

		const lookahead = relativeFrame + 50;
		const lookback = relativeFrame - 50;

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
					const frame = this.frames.get(chunk.timestamp);
					if (frame) {
						frame.close()
						this.frames.delete(chunk.timestamp);
					}
				}
			}
		}

		for (const keyFrame of toDecode) {
			await this.decodeKeyFrame(keyFrame);
		}

	}

	private decodeKeyFrame = async (keyFrame: number) => {
		const chunks = this.keyFrameChunks.get(keyFrame);
		if (!chunks) return;

		const decoder = new VideoDecoder({
			output: async (frame) => {
				const bitmap = await createImageBitmap(frame);
				this.frames.set(frame.timestamp!, bitmap);
				frame.close();
			},
			error: (e) => {
				console.error(e);
			}
		})

		decoder.configure(this.config!)

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

			if (keyFrame[0] > from) {
				break;
			}
		}

		return keyFrames;
	}
}
