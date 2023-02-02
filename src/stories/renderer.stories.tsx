import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Movie } from '../model';
import { Player as PlayerComponent } from '../studio'

export default {
	title: 'Player/Player',
	component: PlayerComponent,
} as ComponentMeta<typeof PlayerComponent>;

const movie: Movie = {
	width: 1920,
	height: 1080,
	fps: 60,
	duration: 70 * 60,
	background: 0xFFFFFF,
	objects: {
		'header1': {
			id: 'header1',
			type: 'text',
			text: 'Atlassian',
			start: 0,
			duration: 15 * 60,
			position: {
				x: 960,
				y: 460,
			},
			size: {
				width: 600,
				height: 72,
			},
			font: {
				size: 104,
				weight: '900',
				color: 'rgb(0, 82, 204)',
				family: 'sans-serif',
			},
			effects: {
				'fadeIn': {
					id: 'fadeIn',
					type: 'fade',
					start: 0,
					duration: 0.5 * 60,
					from: 0,
					to: 1,
					easing: 'easeIn'
				},
				'fadeOut': {
					id: 'fadeOut',
					type: 'fade',
					start: 9.5 * 60,
					duration: 0.5 * 60,
					from: 1,
					to: 0,
					easing: 'easeOut'
				}
			}
		},
		'header2': {
			id: 'header2',
			type: 'text',
			text: 'Director',
			start: 3 * 60,
			duration: 7 * 60,
			position: {
				x: 960,
				y: 560,
			},
			size: {
				width: 600,
				height: 64
			},
			font: {
				size: 96,
				color: 'rgb(23, 43, 77)',
				weight: '700',
				family: 'sans-serif',
			},
			opacity: 0,
			effects: {
				'fadeIn': {
					id: 'fadeIn',
					type: 'fade',
					start: 0,
					duration: 0.5 * 60,
					from: 0,
					to: 1,
					easing: 'easeIn'
				},
				'fadeOut': {
					id: 'fadeOut',
					type: 'fade',
					start: 6.5 * 60,
					duration: 0.5 * 60,
					from: 1,
					to: 0,
					easing: 'easeOut'
				}
			}
		},
		'logo': {
			id: 'logo',
			type: 'image',
			src: '/logo.png',
			start: 4.5 * 60,
			duration: 5.5 * 60,
			size: {
				width: 1,
				height: 1
			},
			position: {
				x: 1920,
				y: 1080,
			},
			opacity: 1,
			effects: {
				'spin': {
					id: 'spin',
					type: 'rotate',
					from: 0,
					to: 3 * 360,
					start: 0,
					duration: 1 * 60,
					easing: 'easeInOut'
				},
				'growing': {
					id: 'growing',
					type: 'scale',
					from: {
						x: 0.001,
						y: 0.001,
					},
					to: {
						x: 0.5,
						y: 0.5,
					},
					start: 0,
					duration: 1 * 60,
					easing: 'easeInOut',
				},
				'move': {
					id: 'move',
					type: 'translate',
					from: {
						x: 1920,
						y: 1080,
					},
					to: {
						x: 560,
						y: 520,
					},
					start: 0,
					duration: 1 * 60,
					easing: 'easeInOut',
				},
				'fadeOut': {
					id: 'fadeOut',
					type: 'fade',
					from: 1,
					to: 0,
					start: 5 * 60,
					duration: 0.5 * 60,
					easing: 'easeOut',
				}
			},
		},
		'clapperboard': {
			id: 'clapperboard',
			type: 'video',
			src: '/test1.mp4',
			start: 9.5 * 60,
			duration: 60 * 60,
			size: {
				width: 1920,
				height: 1080
			},
			position: {
				x: 960,
				y: 540,
			},
			opacity: 1,
			effects: {
				'fadeIn': {
					id: 'fadeIn',
					type: 'fade',
					start: 0,
					duration: 0.5 * 60,
					easing: 'easeIn',
					from: 0,
					to: 1,
				},
				'fadeOut': {
					id: 'fadeIn',
					type: 'fade',
					start: 59.5 * 60,
					duration: 0.5 * 60,
					easing: 'easeOut',
					from: 1,
					to: 0,
				}
			},
		}
	}
}

const Template: ComponentStory<typeof PlayerComponent> = (args) => {
	return <PlayerComponent movie={args.movie} />
};

export const TestMovie = Template.bind({});
TestMovie.args = {
	movie,
}
