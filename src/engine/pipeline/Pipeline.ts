import { Movie } from '../../model';
import { Loader } from '../loader';
import { MovieRenderer } from '../renderers';

export class Pipeline {
	private movie: Movie;
	private loader: Loader;
	private renderer: MovieRenderer | null = null;
	private nextBuffer: number | null = null;
	private bufferPromise: Promise<any> | null = null;
	private audioContext: AudioContext = new AudioContext();

	constructor(movie: Movie) {
		this.movie = movie;
		this.loader = new Loader(this.movie);
	}

	load = async () => {
		await this.loader.fetch();
		this.renderer = new MovieRenderer({
			movie: this.movie,
			loader: this.loader
		});
	}

	buffer = async (frame: number) => {
		this.nextBuffer = frame;
		if (this.bufferPromise) return;

		this.triggerBuffer();
	}

	render = async (frame: number) => {
		if (!this.renderer) throw new Error('Load the pipeline before calling render');

		this.renderer.renderFrame(frame);
	}

	attach = (canvas: HTMLCanvasElement | OffscreenCanvas) => {
		if (!this.renderer) throw new Error('Load the pipeline before calling attach');

		this.renderer.attach(canvas);
	}

	async playAudio() {
		for (const video of this.loader.getVideos()) {
			const audioBufferData = await video.getAudioBufferData();
			if (!audioBufferData) continue;

			const { numberOfChannels, sampleRate } = audioBufferData.config;
			const { channelData } = audioBufferData;

			const numFrames = channelData[0].length;
			let started: number | null = null;

			const playSamples = (number: number, offset: number) => {
				return () => {
					console.log('here');

					const stop = Math.min(offset + number, numFrames);

					for (let i = offset; i < Math.min(offset + number, numFrames); i++) {
						const [data, timestamp] = channelData[0][i];
						const audioBuffer = this.audioContext.createBuffer(numberOfChannels, data.byteLength, sampleRate);

						for (let channel = 0; channel < numberOfChannels; channel++) {
							const [data] = channelData[channel][i];
							audioBuffer.copyToChannel(new Float32Array(data.buffer), channel, 0);
						}

						const source = this.audioContext.createBufferSource()
						source.buffer = audioBuffer;
						source.connect(this.audioContext.destination);


						if (started === null) started = this.audioContext.currentTime;
						const timestampSec = timestamp / (1000 * 1000);

						if (started + timestampSec < this.audioContext.currentTime) continue;
						source.start(started + timestampSec);
					}

					if (stop === numFrames) return;

					const [, timestamp] = channelData[0][stop];
					const timestampSec = timestamp / (1000 * 1000);
					const elapsed = this.audioContext.currentTime - started!;
					const till = timestampSec - elapsed - 1;

					setTimeout(playSamples(500, offset + 500), till * 1000)
				}
			}

			playSamples(500, 0)();
		}
	}

	private triggerBuffer = async () => {
		const frame = this.nextBuffer;
		if (frame === null) return;

		this.nextBuffer = null;

		const buffers = this.loader.getVideos();
		this.bufferPromise = Promise.all(buffers.map(buffer => buffer.buffer(frame, this.movie.fps)));
		await this.bufferPromise;

		if (this.nextBuffer !== null) {
			this.triggerBuffer()
		}
	}
}
