import { createVirtualElement, updateComponent, renderHTMLElement} from 'utils/vdom.mjs';
import Component from 'utils/component.mjs';


export default class App extends Component {
	constructor(props) {
		super(props);
		// Page
		this.state.hash = props.hash;
		this.state.page = props.page;

		// create the virtualElement and HTML element
		this.virtualElement = this.createVirtualComponent(this.props, this.state);
		this.base = renderHTMLElement(this.virtualElement);
	}

	changePage([hash, page]){
		// changes the page and start diffing
		this.state.hash = hash;
		this.state.page = page;
		updateComponent(this);
	}

	createVirtualComponent(props, state){
		return createVirtualElement('div', {
			attributes: { class: 'app' },
			children: [
			]
		});
	}
}