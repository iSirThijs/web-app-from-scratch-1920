import { createVirtualElement } from 'utils/vdom.mjs';
import Component from 'utils/component.mjs';

// Event listener for back link
const previousPage = (event) => {
	event.preventDefault();
	window.history.back();
};

// creates a li with an link to the previous page
const backLink = createVirtualElement('li', {
	children: [ 
		createVirtualElement('a', { 
			attributes: { href: '#' }, 
			events: { 'click': previousPage }, 
			children: ['Back'] })
	]
});

// creates a li with link to a page
const createPageLink = (link) => {
	return createVirtualElement('li', { 
		children: [ 
			createVirtualElement('a', {
				attributes: { href: `#${link}` }, 
				children: [link]
			})
		]});
};

// creates the links in the navbar
const links = (links) => {
	return [ 
		backLink, 
		...links.map(createPageLink)
	];
};


export default class Nav extends Component {
	constructor(props) {
		super(props);
	}

	createVirtualComponent(props, state) {
		return createVirtualElement('nav', {
			children: [
				createVirtualElement('ul', {
					children: links(props.pages)
				}),
				// nav bar
			]
		});
	}
}