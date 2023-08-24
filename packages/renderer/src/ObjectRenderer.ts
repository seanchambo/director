import { Loader } from '@director/loader';
import { MediaObject, VideoMediaObject } from '@director/model';
import { ImageMediaObject, TextMediaObject } from '@director/model';
import * as PIXI from 'pixi.js';

export interface IObjectRenderer {
	mount(to: PIXI.Container): Promise<void> | void;
	unmount(from: PIXI.Container): Promise<void> | void;
	update(frame: number, fps: number): Promise<void> | void;
}

export class ObjectRenderer {
	static for(object: MediaObject, loader: Loader): IObjectRenderer | null {
		if (object.type === 'text') return new TextObjectRenderer(object);
		if (object.type === 'image') return new ImageObjectRenderer(object, loader);
		if (object.type === 'video') return new VideoObjectRenderer(object, loader);

		return null;
	}
}

class TextObjectRenderer implements IObjectRenderer {
	private object: TextMediaObject;
	private displayObject: PIXI.Text;

	constructor(object: TextMediaObject) {
		this.object = object;
		this.displayObject = new PIXI.Text(this.object.text);
	}

	mount(to: PIXI.Container) {
		this.displayObject.anchor.set(0.5, 0.5);

		this.displayObject.style.fill = this.object.font.color;
		this.displayObject.style.fontSize = this.object.font.size;
		this.displayObject.style.fontWeight = this.object.font.weight;

		this.displayObject.position.set(this.object.position.x, this.object.position.y);

		to.addChild(this.displayObject);
	}

	update(frame: number) {

	}

	unmount(from: PIXI.Container) {
		from.removeChild(this.displayObject);
	}
}

class VideoObjectRenderer implements IObjectRenderer {
	private object: VideoMediaObject;
	private displayObject: PIXI.Sprite;

	constructor(object: VideoMediaObject, loader: Loader) {
		this.object = object;
		this.displayObject = PIXI.Sprite.from(loader.getImage(object.id)!);
		// @ts-ignore
		this.displayObject.texture.baseTexture.resource.source.pause()
	}

	mount(to: PIXI.Container) {
		this.displayObject.anchor.set(0.5, 0.5);

		// this.displayObject.height = this.object.size.height;
		// this.displayObject.width = this.object.size.width;

		this.displayObject.position.set(
			this.object.position.x,
			this.object.position.y
		);

		to.addChild(this.displayObject)
	}

	update(frame: number, fps: number) {
		return new Promise<void>((resolve) => {
			const seeked = () => {
				this.displayObject.texture.update();
				resolve();

				// @ts-ignore
				this.displayObject.texture.baseTexture.resource.source.onseeked = null;
			}

			// @ts-ignore
			this.displayObject.texture.baseTexture.resource.source.onseeked = seeked;

			const framesSinceStart = frame - this.object.start;
			const timeSinceStart = framesSinceStart / fps;

			// @ts-ignore
			this.displayObject.texture.baseTexture.resource.source.currentTime = timeSinceStart;
		})
	}

	unmount(from: PIXI.Container) {
		from.removeChild(this.displayObject);
	}
}

class ImageObjectRenderer implements IObjectRenderer {
	private object: ImageMediaObject;
	private displayObject: PIXI.Sprite;

	constructor(object: ImageMediaObject, loader: Loader) {
		this.object = object;
		this.displayObject = PIXI.Sprite.from(loader.getImage(object.id)!);

		console.log(this.displayObject);
	}

	mount(to: PIXI.Container) {
		this.displayObject.anchor.set(0.5, 0.5);

		this.displayObject.height = this.object.size.height;
		this.displayObject.width = this.object.size.width;

		this.displayObject.position.set(
			this.object.position.x,
			this.object.position.y
		);

		to.addChild(this.displayObject);
	}

	update(frame: number) {

	}

	unmount(from: PIXI.Container) {
		from.removeChild(this.displayObject);
	}
}
