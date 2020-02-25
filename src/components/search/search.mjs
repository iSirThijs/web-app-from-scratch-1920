import { createVirtualElement, updateComponent } from 'utils/vdom.mjs';
import Component from 'utils/component.mjs';
import ResultList from 'components/resultlist.mjs';
import SearchForm from 'components/search.mjs';
import * as rawgAPI from 'modules/api-rawg.mjs';

export default class Search extends Component {
	constructor(props){
		super(props);
		this.state.results= [];
		this.state.searchParams = props.url.searchParams || new URLSearchParams();// add default searchparam?
		this.search = new SearchForm({ setSearchOptions: this.setSearchOptions.bind(this)});
		this.resultList = new ResultList(this.state);
	}

	setSearchOptions({search}){
		this.state.search = search;
		rawgAPI.gameList(this.state).then((data) => this.setResults(data.results));
	}

	setResults(results){
		this.state.results = results;
		updateComponent(this);
	}

	createVirtualComponent(props, state) {
		return createVirtualElement('div', {
			children: [
				this.search.createVirtualComponent(this.search.props, this.search.state),
				this.resultList.createVirtualComponent(this.state, this.resultList.state.results)
			]
		});
	}
}