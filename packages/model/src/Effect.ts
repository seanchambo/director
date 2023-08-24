import { Position } from '.';

export type EffectEasing = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';

export interface BaseEffect {
	id: string;
	start: number;
	end: number;
	easing: EffectEasing;
}

export interface TranslateEffect extends BaseEffect {
	type: 'translate';
	position: Position
}

export interface FadeEffect extends BaseEffect {
	type: 'fade';
	opacity: number;
}

export interface RotateEffectAttrs {
}

export interface RotateEffect extends BaseEffect {
	type: 'rotate';
	degrees: number;
}

export interface ScaleEffectAttrs {
}

export interface ScaleEffect extends BaseEffect {
	type: 'scale';
	scale: Position;
}

export type Effect = TranslateEffect | FadeEffect | RotateEffect | ScaleEffect

export interface TrackVolumeEffect {
	id: string;
	type: 'volume';
	attrs: {
		startVolume: number;
		endVolume: number;
		start: number;
		end: number;
		easing: 'linear' | 'exponential';
	}
}
