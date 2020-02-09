import { createVirtualElement } from '../modules/vdom.mjs';
import Component from '../modules/component.mjs';


export default class Header extends Component {
	constructor(attrs) {
		super(attrs);
		this.state = {text: 'Hello World'};
		this.timer = setTimeout(() => {
			this.setState({text: 'Welcome Back Thijs'});
		}, 1000);
	}

	render(attrs, state) {
		return createVirtualElement('header', {
			attrs: { id: 'header'},
			children: [
				createVirtualElement('h1', {children: ['Game Movie Adaption']}),
				createVirtualElement('p', {children: [state.text]})
			]
		});
	}
}