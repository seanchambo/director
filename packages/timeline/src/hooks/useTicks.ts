import { useMemo } from 'react'

interface UseTicksOpts {
	totalDuration: number;
	getXFromFrame: (frame: number) => number;
	fps: number
}

export interface Tick {
	mark: number;
	x: number;
}

export interface Ticks {
	major: Tick[];
	minor: Tick[];
	sub: Tick[];
}

export const useTicks = ({
	totalDuration,
	getXFromFrame,
	fps
}: UseTicksOpts): Ticks => {
	const ticks = useMemo(() => {
		const majorDuration = 15 * fps;
		const minorDuration = 5 * fps;
		const subDuration = 1 * fps;

		const major: Tick[] = [];
		const minor: Tick[] = [];
		const sub: Tick[] = [];

		for (let i = 0; i <= totalDuration; i += majorDuration) {
			major.push({
				mark: i / fps,
				x: getXFromFrame(i),
			});
		}

		for (let i = 0; i <= totalDuration; i += minorDuration) {
			if (i % majorDuration !== 0) {
				minor.push({
					mark: i / fps,
					x: getXFromFrame(i),
				});
			}
		}

		for (let i = 0; i <= totalDuration; i += subDuration) {
			if (i % majorDuration !== 0 && i % minorDuration !== 0) {
				sub.push({
					mark: i / fps,
					x: getXFromFrame(i),
				});
			}
		}

		return {
			major,
			minor,
			sub
		}
	}, [totalDuration, getXFromFrame, fps]);

	return ticks;
}
