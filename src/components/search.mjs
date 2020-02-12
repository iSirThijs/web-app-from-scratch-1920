import Component from '../utilities/component.mjs';
import { createVirtualElement } from '../utilities/vdom.mjs';


export default class SearchForm extends Component {
	constructor(props) {
		super(props);
		this.submit = this.submit.bind(this); // allows access to this component instead of the $element
	}

	submit(event){
		event.preventDefault();
		if(event.target[0].value.length >= 1) this.props.setSearchOptions({search: event.target[0].value});
		else alert('please enter a search term');
	}

	createVirtualComponent(props, state){
		return createVirtualElement('form', {
			attributes: { class: 'result-list'},
			events: { submit: this.submit},
			children: [
				createVirtualElement('input', {attributes: { type: 'search'}}),
				createVirtualElement('button', {attributes: { type: 'submit'}, children: ['search']})
			]
		});
	}

}

