import Component from 'utils/component.mjs';
import { createVirtualElement } from 'utils/vdom.mjs';

export default class Home extends Component {
	createVirtualComponent(props, state){
		return createVirtualElement('main', {
			attributes: {id: 'home', class: 'page'}
		});
	}
}