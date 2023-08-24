import React from 'react';

interface Props {
	zoomIn: () => void;
	zoomOut: () => void;
}

export const Controls = ({ zoomIn, zoomOut }: Props) => {
	return <div style={{ display: 'flex' }}>
		<button onClick={zoomIn}>+</button>
		<button onClick={zoomOut}>-</button>
	</div>
}
