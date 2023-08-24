import { ImageMediaObject, Movie, VideoMediaObject } from '@director/model';
import { FrameBuffer } from './FrameBuffer';

export class Loader {
	private videoAssets: Record<string, FrameBuffer> = {};
	private imageAssets: Record<string, ImageBitmap> = {};
	private soundAssets: Record<string, AudioData> = {};
	private movie: Movie;

	constructor(movie: Movie) {
		this.movie = movie;
	}

	fetch() {
		const promises: Array<Promise<any>> = [];

		for (const [id, object] of Object.entries(this.movie.objects)) {
			if (object.type === 'image') {
				promises.push(this.fetchImage(object));
			}

			if (object.type === 'video') {
				promises.push(this.fetchVideo(object));
			}
		}

		return Promise.all(promises);
	}

	getImage = (imageObject: ImageMediaObject) => {
		return this.imageAssets[imageObject.id] || null;
	}

	getVideo = (videoObject: VideoMediaObject) => {
		return this.videoAssets[videoObject.id] || null;
	}

	getFrameBuffers = () => {
		return Object.values(this.videoAssets);
	}

	private fetchImage = (imageObject: ImageMediaObject) => {
		return fetch(imageObject.src)
			.then(response => response.blob())
			.then(blob => createImageBitmap(blob))
			.then(bitmap => this.imageAssets[imageObject.id] = bitmap)
	}

	private fetchVideo = async (videoObject: VideoMediaObject) => {
		const frameBuffer = new FrameBuffer({ videoObject });
		await frameBuffer.initialize();

		this.videoAssets[videoObject.id] = frameBuffer;
	}
}
