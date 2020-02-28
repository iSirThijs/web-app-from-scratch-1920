import Component from 'utils/component.mjs';
import { createVirtualElement, updateComponent } from 'utils/vdom.mjs';
import * as rawgAPI from 'modules/api-rawg.mjs';


export default class SearchForm extends Component {
	constructor(props){
		super(props);
		this.props.submit = (event) => {
			event.preventDefault();
			let targets = Object.values(event.target);

			let search = targets.reduce((searchParams, target, index, targetsArr) => {
				if(target.type === 'checkbox' && target.checked) {
					let oldValues = searchParams[target.name] || [];
					searchParams[target.name] = [target.value, ...oldValues];
				} else if(target.type === 'text' && target.name) searchParams[target.name] = target.value;

				if ( index + 1 == targetsArr.length) {
					for (let key in searchParams) {
						if(Array.isArray(searchParams[key])) searchParams[key] = searchParams[key].join(',');
					}
				}
				
				return searchParams;

			}, {});
			props.parent.setApiQuery = search;
		};
		this.state.filters = [];

		this.createFilters();
	}

	createFilters(){
		rawgAPI.getPlatforms()
			.then((data) => data.results )
			.then((results) => {
				this.state.filters = [ createVirtualElement('ul', { children: [
					...results.map((result) => {
						return createVirtualElement('li', { children: [
							createVirtualElement('input', {attributes: {type: 'checkbox', name:'parent_platforms', id: result.slug, value: result.id, checked: true}}),
							createVirtualElement('label', {attributes: { for: result.slug }, children: [result.name]})
						]});
					})
				]})
				];
				updateComponent(this);
			});


	}

	createVirtualComponent(props, state) {

		return createVirtualElement('form', {
			events: {'submit': props.submit },
			children: [
				createVirtualElement('input', {attributes: {name: 'search', type: 'text', value: props.value}}),
				...state.filters,
				createVirtualElement('button', {attributes: {type: 'submit'}, children: ['Search']}),
			]
		});
	}

}