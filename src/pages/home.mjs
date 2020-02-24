import Component from 'utils/component.mjs';
import { createVirtualElement } from 'utils/vdom.mjs';

export default class Home extends Component {
	createVirtualComponent(){
		return createVirtualElement('main', { 
			children: [
				createVirtualElement('p', { children: ['Hello World']}),
				createVirtualElement('a', {
					attributes: { href: '#test'},
					children: ['Go to test page']
				})
			]
		});
	}
}