import { useCallback, useState } from 'react'

export const useZoom = () => {
	const [zoom, setZoom] = useState(1.0);

	const zoomIn = useCallback(() => {
		const newZoom = zoom * 0.95;
		setZoom(Math.max(newZoom, 0.5));
	}, [zoom, setZoom]);

	const zoomOut = useCallback(() => {
		const newZoom = zoom * 1.05;
		setZoom(Math.min(newZoom, 2.0));
	}, [zoom, setZoom])

	return {
		zoom,
		zoomIn,
		zoomOut
	}
}
