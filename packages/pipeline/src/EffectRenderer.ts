import {
	Effect,
	FadeEffect,
	TranslateEffect,
	RotateEffect,
	ScaleEffect,
	Position,
} from '@director/model';
import { easing } from 'ts-easing'
import * as PIXI from 'pixi.js';

export interface EffectUpdateOpts {
	frame: number;
	displayObject: PIXI.DisplayObject;
}

export interface EffectRendererOpts<
	EffectType extends Effect,
	> {
	effect: EffectType;
	displayObject: PIXI.DisplayObject;
}

export interface EffectUpdateDisplayObjectOpts {
	frame: number;
	totalFrames: number;
	progress: number;
}

export abstract class BaseEffectRenderer<
	EffectType extends Effect,
	State extends Record<string, any>
	> {
	effect: EffectType;
	displayObject: PIXI.DisplayObject;
	state: State | null = null;

	abstract updateDisplayObject(opts: EffectUpdateDisplayObjectOpts): void;
	abstract initState(): void;

	constructor({ effect, displayObject }: EffectRendererOpts<EffectType>) {
		this.effect = effect;
		this.displayObject = displayObject;
	}

	update({ frame, displayObject }: EffectUpdateOpts) {
		console.log(frame, this.effect.start, this.effect.end);
		if (frame < this.effect.start) return;
		if (frame >= this.effect.end) return;

		console.log('updating effect renderer', this.displayObject);

		if (this.state === null) {
			this.initState();
		}

		const totalFrames = this.effect.end - this.effect.start;
		const current = frame - this.effect.start;
		let progress = current / totalFrames;
		if (this.effect.easing) {
			if (this.effect.easing === 'easeIn') {
				progress = easing.inQuad(progress);
			}
			if (this.effect.easing === 'easeOut') {
				progress = easing.outQuad(progress);
			}
			if (this.effect.easing === 'easeInOut') {
				progress = easing.inOutQuad(progress);
			}
			if (this.effect.easing === 'linear') {
				progress = easing.linear(progress);
			}
		}

		this.updateDisplayObject({ frame, progress, totalFrames });
	}
}

export interface FadeState {
	initOpacity: number;
}

export class FadeRenderer extends BaseEffectRenderer<FadeEffect, FadeState> {
	initState() {
		this.state = { initOpacity: this.displayObject.alpha };
	}
	updateDisplayObject({ progress }: EffectUpdateDisplayObjectOpts) {
		const { initOpacity } = this.state!;
		const diff = this.effect.opacity - initOpacity;
		const change = diff * progress;
		const opacity = initOpacity + change;

		this.displayObject.alpha = opacity;
	}
}

export interface TranslateState {
	initPosition: Position;
}

export class TranslateRenderer extends BaseEffectRenderer<TranslateEffect, TranslateState> {
	initState() {
		this.state = {
			initPosition: {
				x: this.displayObject.position.x,
				y: this.displayObject.position.y
			}
		}
	}
	updateDisplayObject({ progress }: EffectUpdateDisplayObjectOpts) {
		const { x, y } = this.state!.initPosition;

		const changeX = this.effect.position.x - x;
		const changeY = this.effect.position.y - y;
		const newX = x + changeX * progress;
		const newY = y + changeY * progress;

		this.displayObject.position.set(newX, newY);
	}
}

export interface RotateState {
	initAngle: number;
}

export class RotateRenderer extends BaseEffectRenderer<RotateEffect, RotateState> {
	initState() {
		this.state = {
			initAngle: this.displayObject.angle,
		}
	}
	updateDisplayObject({ progress }: EffectUpdateDisplayObjectOpts) {
		const { initAngle } = this.state!;

		const change = this.effect.degrees * progress;
		const newAngle = initAngle + change;

		this.displayObject.angle = newAngle;
	}
}

export interface ScaleState {
	initScale: Position;
}

export class ScaleRenderer extends BaseEffectRenderer<ScaleEffect, ScaleState> {
	initState() {
		this.state = {
			initScale: {
				x: this.displayObject.scale.x,
				y: this.displayObject.scale.y
			},
		}
	}
	updateDisplayObject({ progress }: EffectUpdateDisplayObjectOpts) {
		const { x, y } = this.state!.initScale;

		const endX = x * this.effect.scale.x;
		const endY = y * this.effect.scale.y;
		const changeX = endX - x;
		const changeY = endY - y;
		const newX = x + changeX * progress;
		const newY = y + changeY * progress;

		this.displayObject.scale.set(newX, newY);
	}
}


export type EffectRenderer = TranslateRenderer | FadeRenderer | ScaleRenderer | RotateRenderer;
