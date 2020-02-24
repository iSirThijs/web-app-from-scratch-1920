import Component from '../utilities/component.mjs';
import { createVirtualElement } from '../utilities/vdom.mjs';


export default class ResultCard extends Component {
	constructor(props) {
		super(props);
	}

	createVirtualComponent(props, state) {
		return createVirtualElement('article', {
			attributes: { id: props.id },
			children: [
				createVirtualElement('h3', {
					children: [props.name]
				})
			]
		});
	}
}