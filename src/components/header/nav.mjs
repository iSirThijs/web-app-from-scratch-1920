import { createVirtualElement } from 'utils/vdom.mjs';
import Component from 'utils/component.mjs';

// Event listener for back button
const back = (event) => {
	event.preventDefault();
	window.history.back();
};

// Links in the nav bar
const ulLinks = [
	createVirtualElement('li', {
		children: [ createVirtualElement('a', { 
			attributes: { href: '#' }, 
			events: { 'click': back }, 
			children: ['Back'] })]
	}),
	createVirtualElement('li', {
		children: [ createVirtualElement('a', { 
			attributes: { href: '#home' }, 
			children: ['Home'] })]
	}),
	createVirtualElement('li', {
		children: [ createVirtualElement('a', {
			attributes: { href: '#search' }, 
			children: ['Search'] })]
	})
];

export default class Nav extends Component {
	constructor(props) {
		super(props);
	}

	createVirtualComponent(props, state) {
		return createVirtualElement('nav', {
			children: [
				createVirtualElement('ul', {
					children: ulLinks
				}),
				// nav bar
			]
		});
	}
}