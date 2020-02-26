import { updateComponent } from 'utils/vdom.mjs';
import { renderHTMLElement, createVirtualElement } from 'utils/vdom.mjs';

export default class Component {
	constructor(props) {
		this.props = props;
		this.state = {};

		this.virtualElement = this.createVirtualComponent(this.props, this.state);
		this.base = renderHTMLElement(this.virtualElement);

	}

	setState(state) {
		this.state = Object.assign({}, state);
		updateComponent(this);
	}

	createVirtualComponent(props, state) {
		return createVirtualElement('div');
	}

}
