import { MediaObject } from '@director/model';
import { useCallback, useMemo } from 'react';
import { useFrameIndicator } from './useFrameIndicator';
import { useMediaObjectElements } from './useMediaObjectElements';
import { useTicks } from './useTicks';

interface UseAxisOpts {
	width: number;
	height: number;
	duration: number;
	fps: number;
	mediaObjects: MediaObject[];
	startPadding: number;
	endPadding: number;
	currentFrame: number;
	zoom: number;
}

export const useAxis = ({
	duration,
	width,
	height,
	fps,
	mediaObjects,
	startPadding,
	endPadding,
	currentFrame,
	zoom
}: UseAxisOpts) => {
	const windowDuration = useMemo(() => zoom * duration, [zoom, duration]);
	const totalWidth = useMemo(() => Math.max(width / zoom, width), [width, zoom]);

	const getFrameFromX = useCallback((x: number) => {
		if (x < startPadding) return 0;
		if (x > totalWidth) return duration;

		const ratio = (x - startPadding) / totalWidth;
		return Math.floor(windowDuration * ratio);
	}, [totalWidth, windowDuration, startPadding]);

	const getXFromFrame = useCallback((frame: number) => {
		const ratio = frame / windowDuration;
		return (totalWidth * ratio) + startPadding;
	}, [windowDuration, totalWidth, startPadding]);

	const getWidthFromDuration = useCallback((itemDuration: number) => {
		const ratio = itemDuration / windowDuration;
		return totalWidth * ratio;
	}, [windowDuration, totalWidth])

	const ticks = useTicks({
		totalDuration: Math.max(windowDuration, duration),
		getXFromFrame,
		fps
	});

	const { mediaObjectElements, lanesHeight } = useMediaObjectElements({
		getWidthFromDuration,
		getXFromFrame,
		mediaObjects,
		height,
	})

	const frameIndicator = useFrameIndicator({ getXFromFrame, frame: currentFrame });

	return {
		ticks,
		frameIndicator,
		mediaObjectElements,
		lanesHeight,
		getFrameFromX,
		getXFromFrame,
		getWidthFromDuration,
		totalWidth,
	}
}
