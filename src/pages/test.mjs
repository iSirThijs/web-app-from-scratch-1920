import Component from 'utils/component.mjs';
import { createVirtualElement } from 'utils/vdom.mjs';

export default class Test extends Component {
	createVirtualComponent(){
		return createVirtualElement('main', { 
			children: [
				createVirtualElement('p', { children: ['Test Page']}),
				createVirtualElement('a', {
					attributes: { href: '#home'},
					children: ['Go to home page']
				})
			]
		});
	}
}