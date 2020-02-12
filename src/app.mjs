import { createVirtualElement, diff} from './utilities/vdom.mjs';
import Header from './components/header.mjs';
import Component from './utilities/component.mjs';
import Overview from './pages/overview.mjs';


class App extends Component {
	createVirtualComponent(){
		return createVirtualElement('div', {
			attributes: { class: 'app' },
			children: [
				createVirtualElement(Header),
				createVirtualElement(Overview)
			]
		});
	}
}

const render = (vnode, parent) => {
	diff(undefined, undefined, vnode, parent);
};

render(createVirtualElement(App), document.body);