import { Movie } from '@director/model';
import * as PIXI from 'pixi.js'
import { AudioLoader } from './AudioLoader';
import { VideoLoader } from './VideoLoader';

export interface LoaderOpts {
	movie: Movie;
}

export class Loader {
	imageResources: Record<string, PIXI.Texture> = {};
	imageLoader: PIXI.Loader = new PIXI.Loader();
	audioLoader: AudioLoader = new AudioLoader();
	audioResources: Record<string, AudioBuffer> = {};

	constructor({ movie }: LoaderOpts) {
		for (const object of Object.values(movie.objects)) {
			if (object.type === 'image') {
				this.imageLoader.add(object.id, object.src);
			}

			if (object.type === 'audio') {
				this.audioLoader.add(object.id, object.src);
			}

			if (object.type === 'video') {
				this.imageLoader.add(object.id, object.src);
			}
		}
	}

	getImage(id: string) {
		return this.imageResources[id] || null;
	};

	getAudio(id: string) {
		return this.audioResources[id] || null;
	};

	fetch() {
		return Promise.all([
			this.fetchAudio(),
			this.fetchImages(),
		]);
	}

	private async fetchAudio() {
		const resources = await this.audioLoader.load();

		for (const [id, buffer] of Object.entries(resources)) {
			if (buffer) {
				this.audioResources[id] = buffer;
			}
		}
	}

	private async fetchImages() {
		return new Promise<void>((resolve) => {
			this.imageLoader.load((loader, resources) => {
				for (const [id, { data, texture }] of Object.entries(resources)) {
					if (texture) {
						this.imageResources[id] = texture;
					} else {
						this.imageResources[id] = PIXI.Texture.from(data);
					}
				}

				resolve();
			});
		});
	}
}
