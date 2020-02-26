import { updateComponent } from 'utils/vdom.mjs';
import { renderHTMLElement, createVirtualElement } from 'utils/vdom.mjs';

export default class Component {
	constructor(props) {
		this.props = props;
		this.state = {};

	}

	setState(state) {
		this.state = Object.assign({}, state);
		updateComponent(this);
	}

}
