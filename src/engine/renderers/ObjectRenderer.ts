import { MediaObject, VideoMediaObject, ImageMediaObject, TextMediaObject } from '../../model';
import { Loader } from '../loader'
import * as PIXI from 'pixi.js';
import { VideoResource } from '../resource/VideoResource';
import { Timeline } from './Timeline';

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
	private timeline: Timeline;
	private object: TextMediaObject;
	private displayObject: PIXI.Text;

	constructor(object: TextMediaObject) {
		this.object = object;
		this.displayObject = new PIXI.Text(this.object.text);
		this.timeline = new Timeline(object);
	}

	mount(to: PIXI.Container) {
		this.displayObject.anchor.set(0.5, 0.5);

		this.displayObject.style.fill = this.object.font.color;
		this.displayObject.style.fontSize = this.object.font.size;
		this.displayObject.style.fontWeight = this.object.font.weight;
		this.displayObject.style.fontFamily = this.object.font.family;

		this.displayObject.alpha = this.object.opacity ?? 1;
		this.displayObject.position.set(this.object.position.x, this.object.position.y);
		this.displayObject.rotation = this.object.rotation ?? 0;
		if (this.object.scale) {
			this.displayObject.scale.set(this.object.scale.x, this.object.scale.y);
		}

		to.addChild(this.displayObject);
	}

	update(frameNum: number) {
		this.timeline.updateDisplayObject(this.displayObject, frameNum)
	}

	unmount(from: PIXI.Container) {
		from.removeChild(this.displayObject);
	}
}

class VideoObjectRenderer implements IObjectRenderer {
	private timeline: Timeline;
	private object: VideoMediaObject;
	private resource: VideoResource;
	private displayObject: PIXI.Sprite;

	constructor(object: VideoMediaObject, loader: Loader) {
		this.object = object;
		this.resource = loader.getVideo(object);
		this.displayObject = new PIXI.Sprite();
		this.timeline = new Timeline(object);
	}

	mount(to: PIXI.Container) {
		this.displayObject.anchor.set(0.5, 0.5);

		this.displayObject.height = this.object.size.height;
		this.displayObject.width = this.object.size.width;

		this.displayObject.alpha = this.object.opacity ?? 1;
		this.displayObject.position.set(this.object.position.x, this.object.position.y);
		this.displayObject.rotation = this.object.rotation ?? 0;
		if (this.object.scale) {
			this.displayObject.scale.set(this.object.scale.x, this.object.scale.y);
		}

		to.addChild(this.displayObject)
	}

	async update(frameNum: number, fps: number) {
		const videoFrame = await this.resource.get(frameNum, fps);
		if (videoFrame) {
			const texture = PIXI.Texture.from(videoFrame)
			this.displayObject.texture = texture;
		}

		this.timeline.updateDisplayObject(this.displayObject, frameNum);
	}

	unmount(from: PIXI.Container) {
		from.removeChild(this.displayObject);
	}
}

class ImageObjectRenderer implements IObjectRenderer {
	private timeline: Timeline;
	private object: ImageMediaObject;
	private displayObject: PIXI.Sprite;

	constructor(object: ImageMediaObject, loader: Loader) {
		this.object = object;
		this.displayObject = PIXI.Sprite.from(loader.getImage(object));
		this.timeline = new Timeline(object);
	}

	mount(to: PIXI.Container) {
		this.displayObject.anchor.set(0.5, 0.5);

		this.displayObject.height = this.object.size.height;
		this.displayObject.width = this.object.size.width;

		this.displayObject.alpha = this.object.opacity ?? 1;
		this.displayObject.position.set(this.object.position.x, this.object.position.y);
		this.displayObject.rotation = this.object.rotation ?? 0;
		if (this.object.scale) {
			this.displayObject.scale.set(this.object.scale.x, this.object.scale.y);
		}

		to.addChild(this.displayObject);
	}

	update(frameNum: number) {
		this.timeline.updateDisplayObject(this.displayObject, frameNum);
	}

	unmount(from: PIXI.Container) {
		from.removeChild(this.displayObject);
	}
}
