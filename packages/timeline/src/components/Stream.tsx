import React from 'react';
import { FrameIndicator } from '../hooks/useFrameIndicator';
import { MediaObjectElement } from '../hooks/useMediaObjectElements';
import { Ticks } from '../hooks/useTicks';
import { MediaObject } from './MediaObject';

interface Props {
	mediaObjectElements: MediaObjectElement[];
	width: number;
	height: number;
	frameIndicator: FrameIndicator;
	axisPadding: number;
	lanesHeight: number;
}

export const Stream = ({ mediaObjectElements, width, height, frameIndicator, axisPadding, lanesHeight }: Props) => {
	return <div style={{ width, paddingTop: axisPadding, height: height - axisPadding, overflowY: 'auto' }}>
		<div style={{ width, position: 'relative', height: lanesHeight }}>
			<div style={{
				height: '100%',
				width: 0,
				borderRight: '2px dashed rgba(147, 197, 253, 0.7)',
				position: 'absolute',
				top: 0,
				transform: `translateX(${frameIndicator.x - 1}px)`,
			}} />
			{mediaObjectElements.map(element => <MediaObject element={element} />)}
		</div>
	</div>
}
