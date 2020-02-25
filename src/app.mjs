import { createVirtualElement, updateComponent, renderHTMLElement} from 'utils/vdom.mjs';
import Home from 'pages/home.mjs';
import Header from 'components/header/header.mjs';
import Component from 'utils/component.mjs';

export default class App extends Component {
	constructor(props) {
		super(props);
		this.state.page = props && props.page ? new props.page() : new Home();  // defaults to home(but should have dedicated error/notfound page)
		this.virtualElement = this.createVirtualComponent(this.props, this.state);
		this.base = renderHTMLElement(this.virtualElement);
	}

	changePage(page){
		const url = new URL(document.location);
		this.state.page = new page({url});
		updateComponent(this);
	}

	createVirtualComponent(props, state){
		return createVirtualElement('div', {
			attributes: { class: 'app' },
			children: [
				createVirtualElement(Header),
				state.page.createVirtualComponent(state.page.props, state.page.state)
			]
		});
	}
}