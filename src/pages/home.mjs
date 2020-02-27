import Component from 'utils/component.mjs';
import { createVirtualElement } from 'utils/vdom.mjs';

export default class Home extends Component {
	createVirtualComponent(){
		return createVirtualElement('main', { 
			children: [
				// 
			]
		});
	}
}