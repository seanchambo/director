import React from 'react';
import { ComponentMeta } from '@storybook/react';
import { Movie } from '@director/model';
import { Timeline as TimelineComponent } from './Timeline';
import { useManager } from '@director/manager';

export default {
	title: 'Timeline/Timeline',
	component: TimelineComponent,
} as ComponentMeta<typeof TimelineComponent>;

const movie: Movie = {
	width: 1920,
	height: 1080,
	fps: 60,
	duration: 60 * 60,
	objects: {
		'track2': {
			id: 'track2',
			type: 'audio',
			src: 'PinkPanther60.wav',
			start: 0 * 60,
			duration: 60 * 60,
			volume: 1,
		},
		// 'track1': {
		//   id: 'track1',
		//   type: 'audio',
		//   src: 'freejazz.wav',
		//   start: 0,
		//   duration: 4 * 60,
		//   volume: 1,
		// },
		'prop1': {
			id: 'prop1',
			type: 'text',
			text: 'hi',
			start: 10 * 60,
			duration: 50 * 60,
			position: {
				x: 100,
				y: 100,
			},
			size: {
				width: 50,
				height: 50,
			},
			font: {
				size: 16,
				weight: '500',
				color: 'rgb(255, 255, 255)',
			}
		},
		'prop2': {
			id: 'prop2',
			type: 'image',
			src: '/tracking.jpg',
			start: 0,
			duration: 10 * 60,
			size: {
				height: 100,
				width: 100,
			},
			position: {
				x: 200,
				y: 200,
			},
		},
		'prop6': {
			id: 'prop6',
			type: 'image',
			src: '/tracking.jpg',
			start: 0,
			duration: 10 * 60,
			size: {
				height: 100,
				width: 100,
			},
			position: {
				x: 200,
				y: 200,
			},
		}, 'prop3': {
			id: 'prop3',
			type: 'image',
			src: '/tracking.jpg',
			start: 0,
			duration: 10 * 60,
			size: {
				height: 100,
				width: 100,
			},
			position: {
				x: 200,
				y: 200,
			},
		}, 'prop4': {
			id: 'prop4',
			type: 'image',
			src: '/tracking.jpg',
			start: 0,
			duration: 10 * 60,
			size: {
				height: 100,
				width: 100,
			},
			position: {
				x: 200,
				y: 200,
			},
		}, 'prop5': {
			id: 'prop5',
			type: 'image',
			src: '/tracking.jpg',
			start: 0,
			duration: 10 * 60,
			size: {
				height: 100,
				width: 100,
			},
			position: {
				x: 200,
				y: 200,
			},
		}
	}
}

export const TestMovie = () => {
	const manager = useManager({ movie });

	return <TimelineComponent manager={manager} width={800} height={200} endPadding={32} startPadding={8} axisPadding={8} />
};
