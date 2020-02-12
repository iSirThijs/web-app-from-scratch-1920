import { createVirtualElement } from '../utilities/vdom.mjs';
import Component from '../utilities/component.mjs';


export default class Header extends Component {
	constructor(props) {
		super(props);
	}

	createVirtualComponent(props, state) {
		return createVirtualElement('header', {
			children: [
				createVirtualElement('h1', {children: ['Game Movie Adaption']})
			]
		});
	}
}