import React, { useCallback, useMemo, useRef } from 'react';
import { Manager } from '@director/manager';
import { Header } from './Header';
import { Stream } from './Stream';
import { useAxis } from '../hooks/useAxis';
import { Controls } from './Controls';

export interface Props {
	manager: Manager;
	width: number;
	height: number;
	endPadding: number;
	startPadding: number;
	axisPadding: number;
}

export const Timeline = ({ manager, width, height, endPadding, startPadding, axisPadding }: Props) => {
	const { frame, movie, zoom } = manager;
	const { duration, fps, objects } = movie;

	const mediaObjects = useMemo(() => Object.values(objects), [objects]);
	const innerEl = useRef<HTMLDivElement | null>(null);

	const {
		ticks,
		mediaObjectElements,
		getFrameFromX,
		getXFromFrame,
		totalWidth,
		frameIndicator,
		lanesHeight,
	} = useAxis({
		duration,
		width,
		height: height - axisPadding - 24,
		fps,
		mediaObjects,
		startPadding,
		endPadding,
		currentFrame: frame,
		zoom,
	});

	const getRelativeX = useCallback((clientX: number) => {
		const { x } = innerEl.current!.getBoundingClientRect();
		const scrollLeft = innerEl.current!.scrollLeft;
		return clientX - x + scrollLeft;
	}, [innerEl.current])

	return (
		<div>
			<div style={{ width, height, display: 'flex' }}>
				<div
					ref={innerEl}
					style={{ overflowX: 'auto', width: totalWidth + endPadding + startPadding }}>
					<Header
						getXFromFrame={getXFromFrame}
						getFrameFromX={getFrameFromX}
						manager={manager}
						getRelativeX={getRelativeX}
						ticks={ticks}
						width={width}
						frameIndicator={frameIndicator} />
					<Stream
						mediaObjectElements={mediaObjectElements}
						width={width}
						height={height - 24}
						lanesHeight={lanesHeight}
						axisPadding={axisPadding}
						frameIndicator={frameIndicator} />
				</div>
			</div>
		</div>
	)
}
