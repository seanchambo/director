import { Movie } from '@director/model'
import { Loader } from '@director/loader'
import { AudioPlayer } from './AudioPlayer';

interface ConductorOpts {
	audioContext: AudioContext | OfflineAudioContext;
	movie: Movie;
	loader: Loader;
}

export class Conductor {
	audioContext: AudioContext | OfflineAudioContext;
	movie: Movie;
	objectPlayers: Record<string, AudioPlayer>;
	loader: Loader;

	constructor({ audioContext, movie, loader }: ConductorOpts) {
		this.audioContext = audioContext;
		this.movie = movie;
		this.loader = loader;
		this.objectPlayers = {};

		for (const object of Object.values(this.movie.objects)) {
			if (object.type === 'audio') {
				this.objectPlayers[object.id] = new AudioPlayer({ object, conductor: this, loader });
			}
		}
	}

	play(from: number) {
		for (const player of Object.values(this.objectPlayers)) {
			player.schedule({ from, now: this.audioContext.currentTime });
		}
	}

	stop() {
		for (const player of Object.values(this.objectPlayers)) {
			player.stop();
		}
	}
}
