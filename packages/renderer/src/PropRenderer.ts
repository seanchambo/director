import * as PIXI from 'pixi.js';
import {
	TextProp,
	ImageProp,
	Prop,
	FadeAnimation,
	TranslateAnimation,
	RotateAnimation,
	ScaleAnimation
} from '@director/model';
import {
	Animator,
	TranslateAnimator,
	FadeAnimator,
	RotateAnimator,
	ScaleAnimator
} from './Animator';
import { Loader } from '@director/loader';

export interface PropRendererOpts<PropType extends Prop> {
	prop: PropType;
}

export abstract class PropRenderer<PropType extends Prop> {
	abstract prop: PropType;
	abstract displayObject: PIXI.DisplayObject;
	animators: Record<string, Animator<any, any>> = {};
	abstract render(to: PIXI.Container): void;

	buildAnimators() {
		for (const [id, animation] of Object.entries(this.prop.animations)) {
			if (animation.type === 'fade') {
				this.animators[id] = new FadeAnimator({
					animation: animation,
					displayObject: this.displayObject
				});
			}

			if (animation.type === 'translate') {
				this.animators[id] = new TranslateAnimator({
					animation: animation,
					displayObject: this.displayObject
				});
			}

			if (animation.type === 'rotate') {
				this.animators[id] = new RotateAnimator({
					animation: animation,
					displayObject: this.displayObject,
				})
			}

			if (animation.type === 'scale') {
				this.animators[id] = new ScaleAnimator({
					animation: animation,
					displayObject: this.displayObject,
				})
			}
		}
	}

	update(frame: number) {
		for (const animator of Object.values(this.animators)) {
			animator.update({
				displayObject: this.displayObject,
				frame,
			})
		}
	}
}

interface ImagePropRendererOpts {
	prop: ImageProp;
	loader: Loader;
}

export class ImagePropRenderer extends PropRenderer<ImageProp> {
	prop: ImageProp;
	displayObject: PIXI.Sprite;
	loader: Loader;

	constructor({ prop, loader }: ImagePropRendererOpts) {
		super();

		this.loader = loader;

		this.prop = prop;
		this.displayObject = PIXI.Sprite.from(this.loader.getImage(prop.id)!);
		this.buildAnimators();
	}

	render(to: PIXI.Container) {
		this.displayObject.anchor.set(0.5, 0.5);

		this.displayObject.height = this.prop.attrs.size.height;
		this.displayObject.width = this.prop.attrs.size.width;

		this.displayObject.position.set(
			this.prop.attrs.position.x,
			this.prop.attrs.position.y
		);

		for (const animator of Object.values(this.animators)) {
			animator.initState()
		}

		to.addChild(this.displayObject);
	}
}

interface TextPropRendererOpts {
	prop: TextProp;
	loader: Loader;
}

export class TextPropRenderer extends PropRenderer<TextProp> {
	prop: TextProp
	displayObject: PIXI.Text;
	loader: Loader;

	constructor({ prop, loader }: TextPropRendererOpts) {
		super();
		this.prop = prop;
		this.displayObject = new PIXI.Text(prop.attrs.content);
		this.loader = loader;

		this.buildAnimators();
	}

	render(to: PIXI.Container) {
		this.displayObject.anchor.set(0.5, 0.5);

		this.displayObject.style.fill = this.prop.attrs.color;
		this.displayObject.style.fontSize = this.prop.attrs.fontSize;
		this.displayObject.style.fontWeight = this.prop.attrs.fontWeight;

		this.displayObject.position.set(this.prop.attrs.position.x, this.prop.attrs.position.y);

		for (const animator of Object.values(this.animators)) {
			animator.initState()
		}

		to.addChild(this.displayObject);
	}
}
