import { createVirtualElement } from '../modules/vdom.mjs';
import Component from '../modules/component.mjs';


export default class Header extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render(props, state) {
		return createVirtualElement('header', {
			children: [
				createVirtualElement('h1', {children: ['Game Movie Adaption']}),
			]
		});
	}
}