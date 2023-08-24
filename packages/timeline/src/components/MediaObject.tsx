import React from 'react';
import { MediaObject as IMediaObject } from '@director/model'
import { MediaObjectElement } from '../hooks/useMediaObjectElements';

interface Props {
	element: MediaObjectElement;
}

const colorMap: Record<IMediaObject['type'], { background: string, border: string, text: string }> = {
	'image': {
		background: 'rgba(239, 68, 68, 0.5)',
		border: 'rgba(239, 68, 68, 0.9)',
		text: 'rgba(239, 68, 68, 1)',
	},
	'audio': {
		background: 'rgba(59, 130, 246, 0.5)',
		border: 'rgba(59, 130, 246, 0.9)',
		text: 'rgba(59, 130, 246, 1)',
	},
	'text': {
		background: 'rgba(16, 185, 129, 0.5)',
		border: 'rgba(16, 185, 129, 0.9)',
		text: 'rgba(16, 185, 129, 1)',
	},
	'subtitle': {
		background: 'rgba(107, 114, 128, 0.5)',
		border: 'rgba(107, 114, 128, 0.9)',
		text: 'rgba(107, 114, 128, 1)',
	},
	'video': {
		background: 'rgba(245, 158, 11, 0.5)',
		border: 'rgba(245, 158, 11, 0.9)',
		text: 'rgba(245, 158, 11, 1)',
	}
}

export const MediaObject = ({ element }: Props) => {
	const colors = colorMap[element.mediaObject.type];

	return (
		<div style={{
			position: 'absolute',
			left: element.x,
			width: element.width,
			height: 32,
			top: element.y,
			background: colors.background,
			border: `1px solid ${colors.border}`,
			minWidth: 1,
			boxSizing: 'border-box',
			borderRadius: 8,
			overflow: 'hidden',
		}}>
			<div style={{ width: '100%', display: 'flex', alignItems: 'center', padding: 8 }}>
				<span style={{ fontSize: 12, color: colors.text }}>
					{element.mediaObject.type}
				</span>
			</div>
		</div>
	)
}
