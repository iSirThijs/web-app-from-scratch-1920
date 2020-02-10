import Component from '../modules/component.mjs';
import { createVirtualElement } from '../modules/vdom.mjs';


export default class ResultCard extends Component {
	constructor(props) {
		super(props);
		this.state = props;
	}

	render(props, state) {
		return createVirtualElement('article', {
			attributes: { id: state.id },
			children: [
				createVirtualElement('h3', {
					children: [state.name]
				})
			]
		});
	}
}


