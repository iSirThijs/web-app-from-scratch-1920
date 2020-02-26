import { createVirtualElement, updateComponent, renderHTMLElement} from 'utils/vdom.mjs';
import Header from 'components/header/header.mjs';
import Component from 'utils/component.mjs';

// Creates the header
const header = (hash, pages) => {
	const header = new Header({hash, pages});
	return header.createVirtualComponent(header.props, header.state);
};


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
				header(state.hash, props.pages),
				createVirtualElement(state.page)
			]
		});
	}
}