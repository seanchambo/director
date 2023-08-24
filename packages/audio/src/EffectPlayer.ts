export const a = 'a';
// import { TrackPlayer } from './AudioPlayer';
// import { TrackEffect } from '@director/model'

// export interface EffectPlayerOpts {
// 	trackPlayer: TrackPlayer;
// 	effect: TrackEffect;
// }

// export interface ScheduleOpts {
// 	from: number;
// 	now: number;
// 	trackStart: number;
// }

// export class EffectPlayer {
// 	trackPlayer: TrackPlayer
// 	effect: TrackEffect;

// 	constructor({ trackPlayer, effect }: EffectPlayerOpts) {
// 		this.trackPlayer = trackPlayer;
// 		this.effect = effect;
// 	}

// 	schedule({ from, now, trackStart }: ScheduleOpts) {
// 		// Effect has already finished before this point
// 		if (trackStart + this.effect.attrs.end < from) {
// 			return
// 		}

// 		const { start, end, endVolume, startVolume, easing } = this.effect.attrs

// 		const duration = end - start;
// 		const delayTillStart = trackStart + start - from;
// 		const delayTillEnd = delayTillStart + duration;


// 		const whenStart = now + (delayTillStart / 1000)
// 		const whenEnd = now + (delayTillEnd / 1000);

// 		this.trackPlayer.gain.gain.setValueAtTime(startVolume, whenStart);
// 		if (easing === 'linear') {
// 			this.trackPlayer.gain.gain.linearRampToValueAtTime(endVolume, whenEnd);
// 		} else {
// 			this.trackPlayer.gain.gain.exponentialRampToValueAtTime(endVolume || 0.0001, whenEnd);
// 		}
// 	}
// }
