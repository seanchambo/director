import { useEffect, useState } from 'react';
import { Movie } from '@director/model';
import { getSceneAtFrame } from '@director/utils'

interface Opts {
	movie: Movie,
}

export interface Editor {
	frame: number;
	setFrame: (frame: number) => void;
	scene: ReturnType<typeof getSceneAtFrame>;
}

export const useEditor = ({ movie }: Opts): Editor => {
	const [frame, setFrame] = useState(0);
	const [scene, setScene] = useState(getSceneAtFrame(movie, 0));

	useEffect(() => {
		const scene = getSceneAtFrame(movie, frame);
		setScene(scene);
	}, [movie, frame])

	return {
		frame,
		setFrame,
		scene,
	}
}
