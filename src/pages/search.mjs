import Component from 'utils/component.mjs';
import { createVirtualElement, updateComponent } from 'utils/vdom.mjs';
import * as rawgAPI from 'modules/api-rawg.mjs';
import Form from 'components/search/form.mjs';
import GameList from 'components/game-list.mjs';
import * as data from 'utils/data.mjs';

export default class Search extends Component {
	constructor(props){
		super(props);

		this.state.apiQueryParams = {
			page_size: 10
		};

		this.state.results = [];

		this.form = new Form({setSearchQuery: this.setSearchQuery.bind(this)});
		this.gameList = new GameList({results: this.state.results});

	}

	setSearchQuery(query) {
		if(query.length < 3) {
			this.state.results = [];
			updateComponent(this);
		}
		else {
			this.state.apiQueryParams.search = query;
			this.getResults(this.state.apiQueryParams);
		}

	}

	getResults(params) {
		rawgAPI.gameList(params)
			.then(data.transformToResultList) 
			.then((gameList) => {
				this.state.results = gameList;
				updateComponent(this);
			});
	}


	// setSearchOptions({search}){
	// 	this.state.search = search;
	// 	rawgAPI.gameList(this.state).then((data) => this.setResults(data.results));
	// }

	createVirtualComponent(props, state){
		let { form, gameList } = this;
		return createVirtualElement('main', { 
			children: [
				form.createVirtualComponent(form.props, form.state),
				gameList.createVirtualComponent(state, gameList.state)
			]
		});
	}
}