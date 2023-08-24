import React, { useCallback, useMemo } from 'react';
import { Ticks } from '../hooks/useTicks';
import { Manager } from '@director/manager'
import { FrameIndicator } from '../hooks/useFrameIndicator';

interface Props {
	ticks: Ticks;
	width: number;
	getRelativeX: (x: number) => number;
	getFrameFromX: (x: number) => number;
	getXFromFrame: (frame: number) => number;
	manager: Manager;
	frameIndicator: FrameIndicator;
}

export const Header = ({ ticks, width, getRelativeX, getFrameFromX, manager, frameIndicator }: Props) => {
	const handleClick = useCallback((event: React.MouseEvent) => {
		const x = getRelativeX(event.clientX);
		const frame = getFrameFromX(x);

		manager.updateFrame(frame);
	}, [getRelativeX, getFrameFromX])

	return <div style={{ width, position: 'relative', height: 24, cursor: 'pointer', userSelect: 'none' }} onClick={handleClick}>
		<div style={{
			position: 'absolute',
			bottom: 0,
			transform: `translateX(${frameIndicator.x - 6}px)`,
			width: 0,
			height: 0,
			borderTop: '6px solid rgba(147, 197, 253, 0.7)',
			borderLeft: '6px solid transparent',
			borderRight: '6px solid transparent',
			zIndex: 2,
		}} />
		{ticks.major.map(tick => (
			<div style={{
				position: 'absolute',
				left: tick.x,
				bottom: 0,
				height: 24,
				width: 'auto'
			}}>

				<span style={{
					display: 'inline-block',
					width: 2,
					position: 'absolute',
					background: 'grey',
					height: 8,
					bottom: 0,
					left: -1,
					boxSizing: 'border-box'
				}}></span>
				<span style={{
					fontSize: 8,
					display: 'inline-block',
					transform: 'translate(-50%, -20%)',
					boxSizing: 'border-box'
				}}>
					{tick.mark}
				</span>
			</div>
		))}
		{ticks.minor.map(tick => (
			<div style={{
				position: 'absolute',
				left: tick.x,
				bottom: 0,
				height: 24,
				width: 'auto'
			}}>
				<span style={{
					display: 'inline-block',
					width: 2,
					position: 'absolute',
					background: 'lightgrey',
					height: 6,
					bottom: 0,
					left: -1,
					boxSizing: 'border-box'
				}}></span>
			</div>
		))}
		{ticks.sub.map(tick => (
			<div style={{
				position: 'absolute',
				left: tick.x,
				bottom: 0,
				height: 24,
				width: 'auto'
			}}>
				<span style={{
					display: 'inline-block',
					width: 2,
					position: 'absolute',
					background: 'lightgrey',
					height: 2,
					bottom: 0,
					left: -1,
					boxSizing: 'border-box'
				}}></span>
			</div>
		))}
	</div>
}
