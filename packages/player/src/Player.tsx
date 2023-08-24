import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { Loader } from '@director/loader';
import { Movie } from '@director/model';
import { Pipeline } from '@director/pipeline';

export interface Props {
	movie: Movie;
	loader: Loader;
}

const getFrameAtTime = (movie: Movie, time: number) => {
	const { fps } = movie;
	const mspf = 1000 / fps;
	return Math.floor(time / mspf);
}

const Player = ({ movie, loader }: Props) => {
	const ref = useRef<HTMLDivElement>(null);
	const start = useRef<null | number>(null);
	// const [frame, setFrame] = useState(() => 0);
	const pipeline = useMemo(() => new Pipeline(movie), [movie]);

	// const nextFrame = useCallback(() => {
	// 	setFrame(frame + 1);
	// }, [frame]);

	// useEffect(() => {
	// 	const main = async () => {
	// 		if (ref.current) {
	// 			await pipeline.load();
	// 			pipeline.buffer(0);
	// 			pipeline.attach(ref.current, { width: 800, height: 800 * (9 / 16) });
	// 		}
	// 	}

	// 	main()
	// }, [pipeline, ref.current]);

	// useEffect(() => {
	// 	pipeline.buffer(frame);
	// 	pipeline.render(frame);
	// }, [pipeline, frame])

	const play = useCallback(() => {
		let rafId: null | number = null

		const main = async () => {
			start.current = performance.now();

			const animate = async () => {
				const now = performance.now();
				const diff = now - start.current!;
				const frame = getFrameAtTime(movie, diff);
				pipeline.buffer(frame);
				await pipeline.render(frame);

				if (frame < movie.duration) {
					rafId = requestAnimationFrame(animate)
				}
			}

			await pipeline.load();
			await pipeline.buffer(0);
			pipeline.attach(ref.current!, { width: 800, height: 800 * (9 / 16) });
			pipeline.render(0);

			rafId = requestAnimationFrame(animate)
		}

		main();
	}, [pipeline, movie]);

	return <div>
		<div>
			<button onClick={play}>Play</button>
		</div>
		<div ref={ref}></div>
	</div>
}

export { Player }
