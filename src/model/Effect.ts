import { Position } from './Position';

export type EffectEasing = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';

export interface BaseEffect<Property> {
	id: string;
	start: number;
	duration: number;
	easing: EffectEasing;
	from: Property;
	to: Property;
}

export interface TranslateEffect extends BaseEffect<Position> {
	type: 'translate';
}

export interface FadeEffect extends BaseEffect<number> {
	type: 'fade';
}

export interface RotateEffect extends BaseEffect<number> {
	type: 'rotate';
}

export interface ScaleEffect extends BaseEffect<Position> {
	type: 'scale';
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
