import { createVirtualElement, updateComponent, renderHTMLElement} from 'utils/vdom.mjs';
import Home from 'pages/home.mjs';
import Header from 'components/header/header.mjs';
import Component from 'utils/component.mjs';

export default class App extends Component {
	constructor(props) {
		super(props);
		this.state.page = props && props.page ? new props.page() : Home;  // defaults to home(but should have dedicated error/notfound page)
		this.virtualElement = this.createVirtualComponent(this.props, this.state);
		this.base = renderHTMLElement(this.virtualElement);
	}

	changePage(page){
		this.state.page = page;
		updateComponent(this);
	}

	createVirtualComponent(props, state){
		return createVirtualElement('div', {
			attributes: { class: 'app' },
			children: [
				createVirtualElement(Header),
				createVirtualElement(state.page)
			]
		});
	}
}