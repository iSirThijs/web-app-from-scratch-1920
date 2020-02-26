import Component from 'utils/component.mjs';
import * as data from 'utils/data.mjs';
import { createVirtualElement, updateComponent } from 'utils/vdom.mjs';
import * as rawgAPI from 'modules/api-rawg.mjs';

// backbutton atom
const backButton = () => {
	const previousPage = (event) => {
		event.preventDefault();
		window.history.back();
	};

	return createVirtualElement('button', {children: ['back'], events: {click: previousPage}});
};

// form molecule
class easySearchForm extends Component {
	constructor(props){
		super(props);
		this.props.input = (event) => {
			props.parent.apiQueryState = event.target.value;
		};
	}

	createVirtualComponent(props, state) {
		return createVirtualElement('form', {
			children: [
				createVirtualElement('input', {attributes: {type: 'text'}, events: {input: props.input}}),
				createVirtualElement('button', {attributes: {type: 'submit'}, children: ['Search']})
			]
		});
	}

}

const form = (props) => {
	let newForm = new easySearchForm(props);
	return newForm.createVirtualComponent(newForm.props, newForm.state);
};

// easySearch list
class easySearchList extends Component {
	constructor(props){
		super(props);
		this.state.results = props.results;

	}

	createVirtualComponent(props, state) {
		return createVirtualElement('ul', {
			children: [
				...state.results.map((result) => {
					return createVirtualElement('li', {
						attributes: { id: result.id },
						children: [
							createVirtualElement('h4', {children: [result.name]})
						]
					});
				})
			]
		});
	}
}

const list = (props) => {
	const newList = new easySearchList(props);
	return newList.createVirtualComponent(newList.props, newList.state);
};


// nav component
export default class Nav extends Component {
	constructor(props) {
		super(props);

		this.state.results = [];

		this.state.apiQuery = {
			page_size: 10
		};

	}

	set apiQueryState(search) {
		if (search.length < 3 ) this.apiResultsState = [];
		else {
			this.state.apiQuery.search = search;

			// there should be more results from different endpoints here(games, developers, creators etc)
			rawgAPI.gameList(this.state.apiQuery)
				.then(data.transformToResultList)
				.then((results) => this.apiResultsState = results);
		}
	
	}

	set apiResultsState(results) {
		this.state.results = results;
		updateComponent(this);
	}

	createVirtualComponent(props, state) {
		return createVirtualElement('nav', {
			children: [
				backButton(),
				form({parent: this}),
				list({results: state.results})
			]
		});
	}
}
