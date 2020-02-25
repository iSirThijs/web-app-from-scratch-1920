import { createVirtualElement } from 'utils/vdom.mjs';
import Component from 'utils/component.mjs';
import Nav from './nav.mjs';


export default class Header extends Component {
	constructor(props) {
		super(props);
	}

	createVirtualComponent(props, state) {
		return createVirtualElement('header', {
			children: [
				createVirtualElement('h1', {children: ['Game Explorer']}),
				createVirtualElement(Nav)
			]
		});
	}
}