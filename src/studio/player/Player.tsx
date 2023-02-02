import React, { useState, useCallback } from 'react';
import { Pipeline } from '../../engine/pipeline'
import { Movie } from '../../model'

interface Props {
	movie: Movie;
}

const getFrameAtTime = (movie: Movie, time: number) => {
	const { fps } = movie;
	const mspf = 1000 / fps;
	return Math.floor(time / mspf);
}

export const Player = ({ movie }: Props) => {
	const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

	const play = useCallback(() => {
		const pipeline = new Pipeline(movie);

		const main = async () => {
			if (pipeline && canvas) {
				console.log('loading');
				await pipeline.load()
				console.log('loaded');
				pipeline.attach(canvas);

				const start = performance.now();
				await pipeline.render(0);
				await pipeline.playAudio();

				const animate = async () => {
					const now = performance.now();
					const diff = now - start;
					const frame = getFrameAtTime(movie, diff);

					if (frame > movie.duration) {
						return;
					}

					await pipeline.buffer(frame);
					await pipeline.render(frame);

					requestAnimationFrame(animate);
				}

				requestAnimationFrame(animate);
			}
		}

		main();
	}, [canvas])

	return (
		<div>
			<button onClick={() => play()}>play</button>
			<canvas ref={(el) => setCanvas(el)} style={{ width: 800, height: 800 * 9 / 16 }} />
		</div>
	)
}
