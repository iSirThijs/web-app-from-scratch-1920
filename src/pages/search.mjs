import Component from 'utils/component.mjs';
import { createVirtualElement } from 'utils/vdom.mjs';

export default class Search extends Component {
	constructor(props){
		super(props);
		console.log(props);
	}

	createVirtualComponent(){
		return createVirtualElement('main', { 
			children: [
				// search page content
			]
		});
	}
}