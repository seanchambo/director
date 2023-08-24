import { MediaObject } from '@director/model';
import { useMemo } from 'react'

interface UseFrameIndicatorOpts {
	getXFromFrame: (frame: number) => number;
	frame: number;
}

export interface FrameIndicator {
	x: number;
}

export const useFrameIndicator = ({
	getXFromFrame,
	frame,
}: UseFrameIndicatorOpts): FrameIndicator => {
	const frameIndicator = useMemo(() => {
		return {
			x: getXFromFrame(frame),
		}
	}, [frame, getXFromFrame]);

	return frameIndicator;
}
