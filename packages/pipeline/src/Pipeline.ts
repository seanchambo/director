import { Movie } from '@director/model';
import { Loader } from './Loader';
import { MovieRenderer } from './Renderer';

export class Pipeline {
	private movie: Movie;
	private loader: Loader;
	private renderer: MovieRenderer | null = null;

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
		const buffers = this.loader.getFrameBuffers();
		await Promise.all(buffers.map(buffer => buffer.bufferFrom(frame, this.movie.fps)));
	}

	render = async (frame: number) => {
		this.renderer!.renderFrame(frame);
	}

	attach = (el: HTMLElement, opts: { width: number, height: number }) => {
		this.renderer!.attach(el, opts);
	}
}
