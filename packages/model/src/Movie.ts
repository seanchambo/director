import { MediaObject } from './MediaObject';

export interface Movie {
	height: number;
	width: number;
	fps: number;
	duration: number;
	background: number;
	objects: Record<string, MediaObject>;
}
