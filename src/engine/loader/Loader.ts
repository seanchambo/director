import { ImageMediaObject, Movie, VideoMediaObject } from '../../model';
import { createVideoResource, VideoResource } from '../resource/VideoResource'

export class Loader {
	private videoAssets: Record<string, VideoResource> = {};
	private imageAssets: Record<string, ImageBitmap> = {};
	private soundAssets: Record<string, AudioData> = {};
	private movie: Movie;

	constructor(movie: Movie) {
		this.movie = movie;
	}

	fetch() {
		const promises: Array<Promise<void>> = [];

		for (const object of Object.values(this.movie.objects)) {
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

	getVideos = () => {
		return Object.values(this.videoAssets);
	}

	private fetchImage = async (imageObject: ImageMediaObject) => {
		await fetch(imageObject.src)
			.then(response => response.blob())
			.then(blob => createImageBitmap(blob))
			.then(bitmap => this.imageAssets[imageObject.id] = bitmap)
	}

	private fetchVideo = async (videoObject: VideoMediaObject) => {
		const resource = await createVideoResource(videoObject);
		this.videoAssets[videoObject.id] = resource;
	}
}
