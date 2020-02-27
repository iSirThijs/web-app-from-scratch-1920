import Component from 'utils/component.mjs';
import { createVirtualElement } from 'utils/vdom.mjs';



export default class EasySearchForm extends Component {
	constructor(props){
		super(props);
		this.props.input = (event) => {
			// creates a tiny delay on typing
			if (this.typingTimer)clearTimeout(this.typingTimer); 
			this.typingTimer = setTimeout(() => props.parent.apiQueryState = event.target.value, 500 );
		};
	}

	createVirtualComponent(props, state) {
		return createVirtualElement('form', {
			events: {'submit': (event) => event.preventDefault()},
			children: [
				createVirtualElement('input', {attributes: {type: 'text', placeholder: 'search for a game, tag or person'}, events: {input: props.input}}),
				// createVirtualElement('button', {attributes: {type: 'submit'}, children: ['Search'], events: {'submit': (event) => event.preventDefault()}})
			]
		});
	}

}