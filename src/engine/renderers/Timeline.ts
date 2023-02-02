import { Effect, EffectEasing, FadeEffect, MediaObject, Position, RotateEffect, ScaleEffect, TranslateEffect } from '../../model';
import * as PIXI from 'pixi.js';
import { easing } from 'ts-easing'

interface Frame {
	opacity?: number;
	position?: Position;
	scale?: Position;
	rotation?: number;
	texture?: PIXI.Texture;
}

const easingProgressMap: Record<EffectEasing, (progress: number) => number> = {
	'easeIn': easing.inQuad,
	'easeOut': easing.outQuad,
	'easeInOut': easing.inOutQuad,
	'linear': easing.linear,
}

const getOpacity = (effect: FadeEffect, progress: number) => {
	const diff = effect.to - effect.from
	return (progress * diff) + effect.from;
}

const getRotation = (effect: RotateEffect, progress: number) => {
	const diff = effect.to - effect.from
	return (progress * diff) + effect.from;
}

const getPosition = (effect: TranslateEffect, progress: number) => {
	const xDiff = effect.to.x - effect.from.x;
	const yDiff = effect.to.y - effect.from.y;
	const xValue = (progress * xDiff) + effect.from.x;
	const yValue = (progress * yDiff) + effect.from.y;

	return { x: xValue, y: yValue };
}

const getScale = (effect: ScaleEffect, progress: number) => {
	const xDiff = effect.to.x - effect.from.x;
	const yDiff = effect.to.y - effect.from.y;
	const xValue = (progress * xDiff) + effect.from.x;
	const yValue = (progress * yDiff) + effect.from.y;

	return { x: xValue, y: yValue };
}

export class Timeline {
	mediaObject: MediaObject;
	frames: Frame[];

	constructor(mediaObject: MediaObject) {
		this.mediaObject = mediaObject;
		this.frames = [];

		this.update();
	}

	update() {
		this.frames = [];
		const effects = Object.values(this.mediaObject.effects);

		let opacity = this.mediaObject.opacity ?? 1;
		let position = this.mediaObject.position ?? { x: 0, y: 0 };
		let scale = this.mediaObject.scale ?? { x: 1, y: 1 };
		let rotation = this.mediaObject.rotation ?? 0;

		for (let i = 0; i < this.mediaObject.duration; i++) {
			for (const effect of effects) {
				if (effect.start > i) continue;
				if (effect.start + effect.duration < i) continue;

				const offset = i - effect.start;
				const easingProgress = easingProgressMap[effect.easing];
				const progress = easingProgress(offset / effect.duration);

				if (effect.type === 'fade') {
					opacity = getOpacity(effect, progress);
				}

				if (effect.type === 'rotate') {
					rotation = getRotation(effect, progress);
				}

				if (effect.type === 'translate') {
					position = getPosition(effect, progress);
				}

				if (effect.type === 'scale') {
					scale = getScale(effect, progress);
				}
			}

			this.frames.push({
				opacity,
				position,
				scale,
				rotation,
			})
		}
	}

	updateDisplayObject(displayObject: PIXI.DisplayObject, frameNum: number) {
		const relative = frameNum - this.mediaObject.start;
		const frame = this.frames[relative];
		if (!frame) return;

		if (frame.opacity !== undefined) {
			displayObject.alpha = frame.opacity;
		}

		if (frame.position !== undefined) {
			displayObject.position.set(frame.position.x, frame.position.y);
		}

		if (frame.scale !== undefined) {
			displayObject.scale.set(frame.scale.x, frame.scale.y);
		}

		if (frame.rotation !== undefined) {
			displayObject.angle = frame.rotation;
		}
	}
}
