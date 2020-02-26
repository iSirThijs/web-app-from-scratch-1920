import Component from 'utils/component.mjs';
import { createVirtualElement } from 'utils/vdom.mjs';
import Nav from 'components/nav.mjs';

const headerDefaults = {
	siteTitle: 'Game Explorer'
};


export default class Header extends Component {
	constructor(props){
		super(headerDefaults);
	
	}
	

	createVirtualComponent(props, state) {
		return createVirtualElement('header', {
			children: [
				createVirtualElement('h1', { children: [props.siteTitle]}),
				createVirtualElement(Nav)
			]
		});

	}
}