import Component from 'utils/component.mjs';
import { createVirtualElement, updateComponent } from 'utils/vdom.mjs';
import * as rawgAPI from 'modules/api-rawg.mjs';
import SearchForm from 'components/search-form.mjs';

export default class Search extends Component {
	constructor(props) {
		super(props);

		this.state.apiQuery = {
			search: undefined,
			page_size: 10
		};

		Object.assign(this.state.apiQuery, parseQueryString(props.param));

		this.state.result = [createVirtualElement('div', {children: ['loading...']})];
		
		// kick off api get
		this.getApiResults(this.props, this.state);
	}

	// setter for apiQuery
	set setApiQuery(search){
		Object.assign(this.state.apiQuery, search);
		this.getApiResults(this.props, this.state);
	}

	getApiResults(props, state){
		this.state.result = [createVirtualElement('div', {children: ['loading...']})];
		rawgAPI.list('games', state.apiQuery)
			.then((list) => list.results)
			.then((results) => {
				
				let list = createVirtualElement('ul', {
					children:  [
						...results.map((result) => {
							return createVirtualElement('li', {
								children: [
									createVirtualElement('a', {
										attributes: { href: `#games/${result.slug}`},
										children: [ createVirtualElement('h4', {children: [result.name]})]
									})
								]
							});
						}),
					]
				});

				this.state.result = [list];
				updateComponent(this);
			});// save data in state
	}


	createVirtualComponent(props, state){
		return createVirtualElement('main', {
			attributes: {id: 'search', class: 'page'},
			children: [ 
				createVirtualElement('h2', {children: ['Advanced Search']}),
				createVirtualElement(SearchForm, {props: {parent: this, value: state.apiQuery.search}}),
				// search input //
				// filter and sort controls/submit -> updates state of this(sent parent as prop)
				...state.result // results (lazy loading needs to be added later)
			]
		});
	}


}

function parseQueryString(string){
	let andSplit = string.split('&');
	let equalSplit = andSplit.map((andSplitted) => andSplitted.split('='));

	let queries = Object.fromEntries(equalSplit);
	return queries;
}