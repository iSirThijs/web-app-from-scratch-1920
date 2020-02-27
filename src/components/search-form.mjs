import Component from 'utils/component.mjs';
import { createVirtualElement } from 'utils/vdom.mjs';

export default class SearchForm extends Component {
	constructor(props){
		super(props);
		this.props.submit = (event) => {
			event.preventDefault();
			let targets = Object.values(event.target);

			let search = targets.reduce((searchParams, target) => {
				if(target.name) searchParams[target.name] = target.value;
				return searchParams;

			}, {});

			props.parent.setApiQuery = search;
		};
	}

	createVirtualComponent(props, state) {
		return createVirtualElement('form', {
			events: {'submit': props.submit },
			children: [
				createVirtualElement('input', {attributes: {name: 'search', type: 'text', value: props.value}}),
				createVirtualElement('button', {attributes: {type: 'submit'}, children: ['Search']})
			]
		});
	}

}