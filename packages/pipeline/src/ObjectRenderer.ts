import { MediaObject, VideoMediaObject } from '@director/model';
import { ImageMediaObject, TextMediaObject } from '@director/model';
import { Loader } from './Loader'
import * as PIXI from 'pixi.js';
import { FrameBuffer } from './FrameBuffer';
import { EffectRenderer, FadeRenderer, RotateRenderer, ScaleRenderer, TranslateRenderer } from './EffectRenderer';

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

const buildEffectRenderers = (object: MediaObject, displayObject: PIXI.DisplayObject) => {
	const effectRenderers: Record<string, EffectRenderer> = {}

	for (const [id, effect] of Object.entries(object.effects)) {
		let renderer: EffectRenderer | null = null;
		if (effect.type === 'scale') {
			renderer = new ScaleRenderer({ effect, displayObject })
		} else if (effect.type === 'fade') {
			renderer = new FadeRenderer({ effect, displayObject })
		} else if (effect.type === 'rotate') {
			renderer = new RotateRenderer({ effect, displayObject })
		} else if (effect.type === 'translate') {
			renderer = new TranslateRenderer({ effect, displayObject })
		}

		if (renderer) {
			effectRenderers[id] = renderer;
		}
	}

	return effectRenderers;
}

class TextObjectRenderer implements IObjectRenderer {
	private object: TextMediaObject;
	private displayObject: PIXI.Text;
	private effects: Record<string, EffectRenderer>;

	constructor(object: TextMediaObject) {
		this.object = object;
		this.displayObject = new PIXI.Text(this.object.text);

		this.effects = buildEffectRenderers(this.object, this.displayObject);
	}

	mount(to: PIXI.Container) {
		this.displayObject.anchor.set(0.5, 0.5);

		this.displayObject.style.fill = this.object.font.color;
		this.displayObject.style.fontSize = this.object.font.size;
		this.displayObject.style.fontWeight = this.object.font.weight;
		this.displayObject.style.fontFamily = this.object.font.family;

		this.displayObject.position.set(this.object.position.x, this.object.position.y);

		this.displayObject.alpha = this.object.opacity;

		to.addChild(this.displayObject);
	}

	update(frame: number) {
		for (const renderer of Object.values(this.effects)) {
			renderer.update({
				displayObject: this.displayObject,
				frame,
			})
		}
	}

	unmount(from: PIXI.Container) {
		from.removeChild(this.displayObject);
	}
}

class VideoObjectRenderer implements IObjectRenderer {
	private object: VideoMediaObject;
	private frameBuffer: FrameBuffer;
	private displayObject: PIXI.Sprite;
	private effects: Record<string, EffectRenderer>;

	constructor(object: VideoMediaObject, loader: Loader) {
		this.object = object;
		this.frameBuffer = loader.getVideo(object);
		this.displayObject = new PIXI.Sprite();

		this.effects = buildEffectRenderers(this.object, this.displayObject);
	}

	mount(to: PIXI.Container) {
		this.displayObject.anchor.set(0.5, 0.5);

		this.displayObject.height = this.object.size.height;
		this.displayObject.width = this.object.size.width;

		this.displayObject.position.set(
			this.object.position.x,
			this.object.position.y
		);

		this.displayObject.alpha = this.object.opacity;


		to.addChild(this.displayObject)
	}

	update(frame: number, fps: number) {
		const videoFrame = this.frameBuffer.getFrame(frame, fps);
		if (videoFrame) {
			const texture = PIXI.Texture.from(videoFrame!)
			this.displayObject.texture = texture;
		}

		for (const renderer of Object.values(this.effects)) {
			renderer.update({
				displayObject: this.displayObject,
				frame,
			})
		}
	}

	unmount(from: PIXI.Container) {
		from.removeChild(this.displayObject);
	}
}

class ImageObjectRenderer implements IObjectRenderer {
	private object: ImageMediaObject;
	private displayObject: PIXI.Sprite;
	private effects: Record<string, EffectRenderer>;

	constructor(object: ImageMediaObject, loader: Loader) {
		this.object = object;
		this.displayObject = PIXI.Sprite.from(loader.getImage(object));

		this.effects = buildEffectRenderers(this.object, this.displayObject);
	}

	mount(to: PIXI.Container) {
		this.displayObject.anchor.set(0.5, 0.5);

		this.displayObject.height = this.object.size.height;
		this.displayObject.width = this.object.size.width;

		this.displayObject.position.set(
			this.object.position.x,
			this.object.position.y
		);

		this.displayObject.alpha = this.object.opacity;

		to.addChild(this.displayObject);
	}

	update(frame: number) {
		for (const renderer of Object.values(this.effects)) {
			renderer.update({
				displayObject: this.displayObject,
				frame,
			})
		}
	}

	unmount(from: PIXI.Container) {
		from.removeChild(this.displayObject);
	}
}
