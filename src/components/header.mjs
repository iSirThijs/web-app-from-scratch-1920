import { createVirtualElement } from '../utilities/vdom.mjs';
import Component from '../utilities/component.mjs';


export default class Header extends Component {
	constructor(props) {
		super(props);
		this.state.text = 'Hello World';
		this.timer = setTimeout(() => {
			this.setState({text: 'welcome back' });
		}, 5000);
	}

	createVirtualComponent(props, state) {
		return createVirtualElement('header', {
			children: [
				createVirtualElement('h1', {children: ['Game Movie Adaption']}),
				createVirtualElement('p', {children: [state.text]})
			]
		});
	}
}