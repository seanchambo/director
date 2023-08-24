import { MediaObject } from '@director/model';
import { useMemo } from 'react'

interface UseMediaObjectElementsOpts {
	getWidthFromDuration: (duration: number) => number;
	getXFromFrame: (frame: number) => number;
	mediaObjects: MediaObject[];
	height: number;
}

export interface MediaObjectElement {
	x: number;
	y: number;
	width: number;
	mediaObject: MediaObject;
}

export const useMediaObjectElements = ({
	getWidthFromDuration,
	getXFromFrame,
	mediaObjects,
	height,
}: UseMediaObjectElementsOpts) => {
	const mediaObjectElements = useMemo(() => {
		const mediaObjectElements: MediaObjectElement[] = [];
		const sorted = [...mediaObjects].sort((a, b) => a.start - b.start);
		const lanes: Array<[number, number] | null> = [];

		const clearFinishedLanes = (from: number) => {
			for (let i = 0; i < lanes.length; i++) {
				const lane = lanes[i];

				if (lane && lane[1] <= from) {
					lanes[i] = null
				}
			}
		}

		const assignToLane = (mediaObject: MediaObject) => {
			let index: number | null = null;
			for (let i = 0; i < lanes.length; i++) {

				if (!lanes[i]) {
					index = i;
					break;
				}
			}

			if (index === null) {
				index = lanes.length;
			}

			lanes[index] = [mediaObject.start, mediaObject.start + mediaObject.duration];

			return index;
		}

		for (const object of sorted) {
			clearFinishedLanes(object.start);
			const index = assignToLane(object);

			const x = getXFromFrame(object.start);
			const width = getWidthFromDuration(object.duration);
			const y = index * 32 + (index > 0 ? (index) * 8 : 0);

			mediaObjectElements.push({
				x,
				width,
				mediaObject: object,
				y
			})
		}

		const lanesHeight = (lanes.length * 32) + ((lanes.length - 1) * 8)

		return {
			mediaObjectElements,
			lanesHeight: Math.max(lanesHeight, height),
		}
	}, [mediaObjects, getXFromFrame, getWidthFromDuration]);

	return mediaObjectElements;
}
