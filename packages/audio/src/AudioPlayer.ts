import { AudioMediaObject } from '@director/model';
import { Loader } from '@director/loader';
import { Conductor } from './Conductor'
// import { EffectPlayer } from './EffectPlayer';

interface TrackPlayerOpts {
	object: AudioMediaObject;
	conductor: Conductor;
	loader: Loader
}

interface ScheduleOpts {
	from: number;
	now: number;
}

export class AudioPlayer {
	object: AudioMediaObject;
	conductor: Conductor;
	source: AudioBufferSourceNode;
	gain: GainNode;
	// effects: Record<string, EffectPlayer>;

	constructor({ object, conductor, loader }: TrackPlayerOpts) {
		this.object = object;
		this.conductor = conductor;
		// this.effects = {};

		const resource = loader.getAudio(this.object.id);

		this.source = this.conductor.audioContext.createBufferSource();
		this.source.buffer = resource;

		this.gain = this.conductor.audioContext.createGain();

		this.source.connect(this.gain);
		this.gain.connect(this.conductor.audioContext.destination);

		// for (const effect of Object.values(this.track.effects)) {
		// 	this.effects[effect.id] = new EffectPlayer({ trackPlayer: this, effect });
		// }
	}

	schedule({ from, now }: ScheduleOpts) {
		let when = now;
		let offset = 0;
		let delay = 0;

		// Track has already played before this point
		if (this.object.start + this.object.duration < from) {
			return
		}

		// Track has started but not finished
		if (this.object.start < from) {
			offset = from - this.object.start;
		}

		// Track yet to start
		if (this.object.start > from) {
			delay = this.object.start - from;
		}

		const offsetTime = this.getTimeFromFrame(offset);
		const delayTime = this.getTimeFromFrame(delay);
		const durationTime = this.getTimeFromFrame(this.object.duration);

		// for (const effectPlayer of Object.values(this.effects)) {
		// 	effectPlayer.schedule({ from, now, trackStart: this.track.start });
		// }

		this.source.start(now + (delayTime / 1000), offsetTime / 1000, durationTime / 1000);
	}

	stop() {
		this.source.stop();
	}

	private getTimeFromFrame(frame: number) {
		const fps = this.conductor.movie.fps;
		const mspf = 1000 / fps;

		return mspf * frame;
	}
}
