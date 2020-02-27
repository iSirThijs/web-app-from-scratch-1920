import Component from 'utils/component.mjs';
import { createVirtualElement, updateComponent } from 'utils/vdom.mjs';
import EasySearchForm from 'components/easy-search-form.mjs';
import EasySearchResult from 'components/easy-search-result.mjs';

// nav component
export default class EasySearch extends Component {
	constructor(props) {
		super(props);
		this.props = {};


		// categories are the endpoint where you can search with a query
		this.props.categories = ['games','tags', 'creators', 'developers' ]; 
		this.props.id = 'easy-search';
		this.state.apiQuery = {
			search: undefined,
			page_size: 5
		};

		this.state.results = [createVirtualElement('div', { attributes: {class: 'hidden'}, children: ['Start typing to search']})];

	}

	set apiQueryState(search) {
		this.state.apiQuery.search = search;
		if( search.length == 0 ) this.results = [createVirtualElement('div', { attributes: {class: 'hidden'}, children: ['Start typing to search']})];
		if( search.length > 0 && search.length < 3) this.results = [createVirtualElement('div', { attributes: {class: 'hidden'}, children: ['Keep typing to search']})];
		else if(search.length >= 3) {
			this.results = [];
			this.results = this.props.categories.map((category) =>{
				return createVirtualElement(EasySearchResult, { 
					props: { 
						category: category,
						apiQuery: this.state.apiQuery 
					}
				});
			});
		}
	}

	set results(results) {
		this.state.results = results;
		updateComponent(this);
	}

	createVirtualComponent(props, state) {
		return createVirtualElement('div', {
			attributes: { id: props.id },
			children: [
				createVirtualElement(EasySearchForm, {props: {parent: this}}),
				...state.results
			]
		});
	}
}




