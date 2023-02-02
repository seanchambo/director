import * as PIXI from 'pixi.js';
import { Movie, MediaObject } from '../../model';
import { ObjectRenderer, IObjectRenderer } from './ObjectRenderer';
import { Loader } from '../loader'

interface MovieRendererOpts {
	movie: Movie;
	loader: Loader;
}

export class MovieRenderer {
	movie: Movie;
	app: PIXI.Application | null = null;
	loader: Loader;
	objectRenderers: Record<string, IObjectRenderer>;
	stage: { objects: Set<MediaObject>, frame: number | null };

	constructor({ movie, loader }: MovieRendererOpts) {
		this.movie = movie;
		this.loader = loader;
		this.objectRenderers = {}
		this.stage = { objects: new Set<MediaObject>(), frame: null };

		for (const object of Object.values(movie.objects)) {
			if (object.type !== 'audio') {
				const renderer = ObjectRenderer.for(object, loader);
				if (renderer) this.objectRenderers[object.id] = renderer;
			}
		}
	}

	attach(canvas: HTMLCanvasElement | OffscreenCanvas) {
		this.app = new PIXI.Application({
			width: this.movie.width,
			height: this.movie.height,
			view: canvas as HTMLCanvasElement,
		});

		this.app.renderer.backgroundColor = this.movie.background;
	}

	async renderFrame(frame: number) {
		if (frame === this.stage.frame) return;
		if (!this.app) return;

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
			const renderer = this.objectRenderers[item.id];
			if (!renderer) continue;

			await renderer.unmount(this.app.stage);
		}

		for (const item of added) {
			const renderer = this.objectRenderers[item.id];
			if (!renderer) {
				continue;
			}

			await renderer.mount(this.app.stage);
			await renderer.update(frame, this.movie.fps);
		}

		for (const item of updated) {
			const renderer = this.objectRenderers[item.id];
			if (!renderer) continue;

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
