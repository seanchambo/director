import 'regenerator-runtime/runtime';
import * as Comlink from 'comlink';
import { VideoMediaObject } from '../../model';
import { FrameBuffer, AudioBufferData } from '../demuxer';


export interface VideoResourceWorker {
	frameBuffer: FrameBuffer | null;
	init(videoObject: VideoMediaObject): Promise<void>;
	buffer(frame: number, fps: number): Promise<void>;
	get(frame: number, fps: number): ImageBitmap | null;
	getAudioBufferData(): AudioBufferData | null;
}

const decoder: VideoResourceWorker = {
	frameBuffer: null,
	async init(videoObject: VideoMediaObject) {
		const frameBuffer = new FrameBuffer({ videoObject });
		await frameBuffer.initialize();
		this.frameBuffer = frameBuffer;
	},
	async buffer(frame: number, fps: number) {
		if (!this.frameBuffer) return;
		await this.frameBuffer.bufferFrom(frame, fps);
	},
	getAudioBufferData() {
		if (!this.frameBuffer) return null;

		return this.frameBuffer.audioBufferData;
	},
	get(frame: number, fps: number) {
		if (!this.frameBuffer) return null;

		const bitmap = this.frameBuffer.getFrame(frame, fps);
		if (bitmap) {
			return bitmap;
		}

		return null;
	}
}

Comlink.expose(decoder);
