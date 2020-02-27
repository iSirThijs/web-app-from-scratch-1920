import Component from 'utils/component.mjs';
import { createVirtualElement, updateComponent, renderHTMLElement} from 'utils/vdom.mjs';
import * as rawgAPI from 'modules/api-rawg.mjs';


export default class EasySearchResult extends Component {
	constructor(props){
		super(props);
		this.props.class = ['easy-search-result', props.category ];
		this.state.result = createVirtualElement('div', {children: ['loading...']});

		this.getApiResults(this.props, this.state);
	}

	getApiResults(props, state){
		rawgAPI.list(props.category, props.apiQuery)
			.then((list) => list.results)
			.then((results) => {
				
				let list = createVirtualElement('ul', {
					children:  [
						...results.map((result) => {
							return createVirtualElement('li', {
								children: [
									createVirtualElement('a', {
										attributes: { href: `#${props.category}/${result.slug}`},
										children: [ createVirtualElement('h4', {children: [result.name]})]
									})
								]
							});
						})
					]
				});

				this.state.result = list;
				updateComponent(this);
			});// save data in state
	}



	createVirtualComponent(props, state){
		return createVirtualElement('div', {
			attributes: { class: props.class.join(' ')},
			children: [
				createVirtualElement('h3', {children: [ props.category ]}),
				state.result
			]
		});
	}

}