import React, { useEffect, useMemo, useState } from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Movie } from '@director/model';
import { Loader } from '@director/loader'
import { Player as PlayerComponent } from './Player';

export default {
  title: 'Player/Player',
  component: PlayerComponent,
} as ComponentMeta<typeof PlayerComponent>;

const movie: Movie = {
  width: 1920,
  height: 1080,
  fps: 60,
  duration: 10 * 1000,
  background: 0xFFFFFF,
  objects: {
    'header1': {
      id: 'header1',
      type: 'text',
      text: 'Atlassian',
      start: 0,
      duration: 10 * 60,
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
      opacity: 0,
      effects: {
        'fadeIn': {
          id: 'fadeIn',
          type: 'fade',
          start: 0 * 60,
          end: 0.5 * 60,
          opacity: 1,
          easing: 'easeIn'
        },
        'fadeOut': {
          id: 'fadeOut',
          type: 'fade',
          start: 9.5 * 60,
          end: 10 * 60,
          opacity: 0,
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
          start: 3 * 60,
          end: 3.5 * 60,
          opacity: 1,
          easing: 'easeIn'
        },
        'fadeOut': {
          id: 'fadeOut',
          type: 'fade',
          start: 9.5 * 60,
          end: 10 * 60,
          opacity: 0,
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
          degrees: 3 * 360,
          start: 4.5 * 60,
          end: 5.5 * 60,
          easing: 'easeInOut'
        },
        'growing': {
          id: 'growing',
          type: 'scale',
          scale: {
            x: 200,
            y: 200,
          },
          start: 4.5 * 60,
          end: 5.5 * 60,
          easing: 'easeInOut',
        },
        'move': {
          id: 'move',
          type: 'translate',
          position: {
            x: 560,
            y: 520,
          },
          start: 4.5 * 60,
          end: 5.5 * 60,
          easing: 'easeInOut',
        },
        'fadeOut': {
          id: 'fadeOut',
          type: 'fade',
          opacity: 0,
          start: 9.5 * 60,
          end: 10 * 60,
          easing: 'easeOut',
        }
      },
    },
    'clapperboard': {
      id: 'clapperboard',
      type: 'video',
      src: '/clapperboard.mp4',
      start: 10 * 60,
      duration: 5 * 60,
      size: {
        width: 1920,
        height: 1080
      },
      position: {
        x: 960,
        y: 540,
      },
      opacity: 1,
      effects: {},
    }
  }
}

const Template: ComponentStory<typeof PlayerComponent> = (args) => {
  const loader = useMemo(() => new Loader({ movie: args.movie }), [movie]);

  return <PlayerComponent movie={args.movie} loader={loader} />
};

export const TestMovie = Template.bind({});
TestMovie.args = {
  movie,
}
