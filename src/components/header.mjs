import { createVirtualElement } from '../modules/vdom.mjs';


const h1 = createVirtualElement('h1', {
	children: ['Game - Movie adaptions']
});


const header = createVirtualElement('header', {
	attrs: {},
	children: [
		h1
	]
});

export default header;