import { renderComponent } from './vdom.mjs';

export default class Component {
	constructor(attrs) {
		this.attrs = attrs;
		this.state = {};
	}

	setState(state) {
		this.state = Object.assign({}, state);
		renderComponent(this);
	}
}
