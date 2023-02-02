import { useEffect } from '@storybook/addons';
import React, { useRef } from 'react';
import Two from 'two.js';

export default {
	title: 'Two Test',
};


export const Test = () => {
	const domElem = useRef(null);


	useEffect(() => {
		if (domElem.current) {
			const two = new Two({
				fullscreen: true,
				autostart: true,
			}).appendTo(domElem.current);

			const image = new Image();
			image.onload = async () => {
				console.log('here');
				const bitmap = await createImageBitmap(image);
				const texture = two.makeTexture(bitmap, () => console.log('loaded'));
				console.log(texture);

				two.render();
			}

			image.src = 'https://img-cdn.tnwcdn.com/image?fit=1200%2C1200&height=1200&url=https%3A%2F%2Fcdn0.tnwcdn.com%2Fwp-content%2Fblogs.dir%2F1%2Ffiles%2F2020%2F02%2FGoogle-Image-Search.jpg&signature=7f82c913e8462f277841314f07a697e8';
		}
	}, [domElem.current])

	return <div ref={domElem} />
}
