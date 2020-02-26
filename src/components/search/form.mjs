import Component from 'utils/component.mjs';
import { createVirtualElement } from 'utils/vdom.mjs';

export default class Form extends Component {
	constructor(props) {
		super(props);
		this.input = this.input.bind(this); // allows access to this component instead of the $element
	}

	input(event){
		this.props.setSearchQuery(event.target.value);
	}

	createVirtualComponent(props, state){
		return createVirtualElement('form', {
			attributes: { class: 'result-list'},
			// events: { submit: this.submit},
			children: [
				createVirtualElement('input', {
					attributes: { type: 'text'}, 
					events: { input: this.input }
				})
			]
		});
	}

}

