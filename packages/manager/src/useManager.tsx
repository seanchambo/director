import { Movie } from '@director/model';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useZoom } from './useZoom';

export interface Manager {
	frame: number;
	updateFrame(frame: number): void;
	movie: Movie;
	zoom: number;
	zoomIn: () => void;
	zoomOut: () => void;
	playing: boolean;
	play: () => void;
	stop: () => void;
	skip: (frames: number) => void;
}

export interface UseManagerOpts {
	movie: Movie;
}

const getFrameAtTime = (movie: Movie, time: number) => {
	const { fps } = movie;
	const mspf = 1000 / fps;
	return Math.floor(time / mspf);
}

export const useManager = ({ movie: initial }: UseManagerOpts): Manager => {
	const [frame, setFrame] = useState(0);
	const [movie, setMovie] = useState(initial);
	const { zoom, zoomIn, zoomOut } = useZoom();
	const [playing, setPlaying] = useState(false);

	const playingRafId = useRef<number | null>();

	useEffect(() => {
		setMovie(initial);
		setFrame(0);
	}, [initial]);

	const skip = useCallback((frames: number) => {
		setFrame(frame + frames);
	}, [frame, setFrame])

	const play = useCallback(() => {
		setPlaying(true);

		const main = async () => {
			const start = performance.now();
			const startingFrame = frame;

			const tick = () => {
				const now = performance.now();
				const diff = now - start;
				const deltaFrames = getFrameAtTime(movie, diff);
				const newFrame = startingFrame + deltaFrames;

				if (newFrame > movie.duration) {
					setFrame(0);
				} else {
					setFrame(newFrame);
				}

				playingRafId.current = requestAnimationFrame(tick);
			}

			playingRafId.current = requestAnimationFrame(tick)
		}

		main();
	}, [movie]);

	const stop = () => {
		if (playingRafId.current) {
			cancelAnimationFrame(playingRafId.current);
		}

		setPlaying(false);
	}

	return {
		frame,
		updateFrame: setFrame,
		movie,
		zoom,
		zoomIn,
		zoomOut,
		play,
		stop,
		skip,
		playing,
	}
}
