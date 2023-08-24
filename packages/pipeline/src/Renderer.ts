import * as PIXI from 'pixi.js';
import { MediaObject, Movie } from '@director/model';
import { ObjectRenderer, IObjectRenderer } from './ObjectRenderer';
import { Loader } from './Loader'

interface MovieRendererOpts {
	movie: Movie;
	loader: Loader;
}

export class MovieRenderer {
	movie: Movie;
	app: PIXI.Application;
	loader: Loader;
	objectRenderers: Record<string, IObjectRenderer>;
	stage: { objects: Set<MediaObject>, frame: number };

	constructor({ movie, loader }: MovieRendererOpts) {
		this.movie = movie;
		this.loader = loader;
		this.app = new PIXI.Application({ width: movie.width, height: movie.height });
		this.objectRenderers = {}
		this.stage = { objects: new Set<MediaObject>(), frame: 0 };

		this.app.renderer.backgroundColor = this.movie.background;

		for (const object of Object.values(movie.objects)) {
			if (object.type !== 'audio') {
				const renderer = ObjectRenderer.for(object, loader);
				if (renderer) this.objectRenderers[object.id] = renderer;
			}
		}
	}

	attach(el: HTMLElement, { width, height }: { width: number, height: number }) {
		el.appendChild(this.app.view);
		this.app.view.style.height = `${height}px`;
		this.app.view.style.width = `${width}px`;
	}

	async renderFrame(frame: number) {
		if (frame === this.stage.frame) return;

		const active = this.getActiveObjects(frame);
		const added = [];
		const updated = [];
		const removed = new Set(this.stage.objects);

		for (const object of active) {
			if (this.stage.objects.has(object)) {
				updated.push(object);
				removed.delete(object);
			} else {
				added.push(object);
			}
		}

		for (const item of removed) {
			const renderer = this.objectRenderers[item.id]!;
			await renderer.unmount(this.app.stage);
		}

		for (const item of added) {
			const renderer = this.objectRenderers[item.id]!;
			await renderer.mount(this.app.stage);
			await renderer.update(frame, this.movie.fps);
		}

		for (const item of updated) {
			const renderer = this.objectRenderers[item.id]!;
			await renderer.update(frame, this.movie.fps);
		}

		this.stage.frame = frame;
		this.stage.objects = new Set([...added, ...updated]);
	}

	private getActiveObjects(frame: number) {
		const active: MediaObject[] = [];

		for (const object of Object.values(this.movie.objects)) {
			if (object.type !== 'audio') {
				if (object.start <= frame && frame < object.start + object.duration) {
					active.push(object);
				}
			}
		}

		return active;
	}
}
