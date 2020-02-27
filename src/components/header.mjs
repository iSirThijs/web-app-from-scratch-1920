import Component from 'utils/component.mjs';
import { createVirtualElement } from 'utils/vdom.mjs';
import EasySearch from 'components/easy-search.mjs';

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
				createVirtualElement(EasySearch)
			]
		});

	}
}