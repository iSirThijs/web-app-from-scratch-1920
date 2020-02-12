import { createVirtualElement, updateComponent } from '../utilities/vdom.mjs';
import Component from '../utilities/component.mjs';
import ResultList from '../components/resultlist.mjs';
import SearchForm from '../components/search.mjs';
import * as rawgAPI from '../utilities/api-rawg.mjs';

export default class Overview extends Component {
	constructor(props){
		super(props);
		this.state.results= [];
		this.state.search = undefined;
		this.search = new SearchForm({ setSearchOptions: this.setSearchOptions.bind(this)});
		this.resultList = new ResultList(this.state);
	}

	setSearchOptions({search}){
		console.log(search);
		this.state.search = search;
		rawgAPI.gameList(this.state).then((data) => this.setResults(data.results));
	}

	setResults(results){
		this.state.results = results;
		updateComponent(this);
	}

	createVirtualComponent(props, state) {
		console.log(props, state);
		return createVirtualElement('main', {
			children: [
				this.search.createVirtualComponent(this.search.props, this.search.state),
				this.resultList.createVirtualComponent(this.state, this.resultList.state.results)
			]
		});
	}
}