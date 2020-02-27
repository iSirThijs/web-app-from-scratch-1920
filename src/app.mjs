import { createVirtualElement, updateComponent, renderHTMLElement} from 'utils/vdom.mjs';
import Component from 'utils/component.mjs';
import Header from './components/header.mjs';


const page = (page, state) => {
	// console.log(page, state);
	if (!page) return createVirtualElement('main');
	else return createVirtualElement(page, {props: state});
};


export default class App extends Component {
	constructor(props) {
		super();
		// Page
		this.state = props;
		this.virtualElement = this.createVirtualComponent(this.props, this.state);
		this.base = renderHTMLElement(this.virtualElement);
	
	}

	changePage(state){
		this.setState({});
		this.setState(state);
		updateComponent(this);
	}

	createVirtualComponent(props, state){
		// console.log(props, state)
		return createVirtualElement('div', {
			attributes: { class: 'app' },
			children: [
				createVirtualElement(Header),
				page(state.page, {slug: state.slug})
			]
		});
	}
}