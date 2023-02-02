import { Effect } from './Effect';
import { Size } from './Size';
import { Position } from './Position'

interface BaseMediaObject {
	id: string;
	duration: number;
	start: number;
	opacity?: number;
	scale?: Position;
	position?: Position;
	rotation?: number;
	effects: Record<string, Effect>;
}

export interface ImageMediaObject extends BaseMediaObject {
	type: 'image';
	src: string;
	size: Size;
	position: Position;
}

export interface TextMediaObject extends BaseMediaObject {
	type: 'text';
	text: string;
	position: Position;
	size: Size;
	font: {
		size: number;
		color: string;
		weight: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
		family: string;
	}
}

export interface VideoMediaObject extends BaseMediaObject {
	type: 'video';
	src: string;
	size: Size;
	position: Position;
}

export interface AudioMediaObject extends BaseMediaObject {
	type: 'audio';
	src: string;
	volume: number;
}

export interface SubtitleMediaObject extends BaseMediaObject {
	type: 'subtitle';
	subtitle: string;
}

export type MediaObject =
	ImageMediaObject |
	TextMediaObject |
	VideoMediaObject |
	AudioMediaObject |
	SubtitleMediaObject;
