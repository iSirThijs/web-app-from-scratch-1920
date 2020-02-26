import { createVirtualElement } from 'utils/vdom.mjs';
import Component from 'utils/component.mjs';
import Nav from 'components/header/nav.mjs';

// Creates a nav bar based on the pages
const nav = (hash, pages) => { 
	let newNav = new Nav({hash, pages});
	return newNav.createVirtualComponent(newNav.props, newNav.state);
};

export default class Header extends Component {
	constructor(props) {
		super(props);
	}

	createVirtualComponent(props, state) {
		return createVirtualElement('header', {
			children: [
				createVirtualElement('h1', {children: ['Game Explorer']}),
				nav(props.hash, props.pages)
			]});
	}
}