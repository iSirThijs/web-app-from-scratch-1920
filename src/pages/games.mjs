import Component from 'utils/component.mjs';
import { createVirtualElement, updateComponent } from 'utils/vdom.mjs';
import * as rawgAPI from 'modules/api-rawg.mjs';

export default class Games extends Component {
	constructor(props) {
		super(props);
		this.state.gameData = [createVirtualElement('div', {children: ['loading...']})];
		// kick off api get
		this.getGameDetailData(this.props.slug);
	}

	getGameDetailData(slug) {
		// query api
		rawgAPI.gameDetails(slug)
			.then((results) => {
				const title = createVirtualElement('h2', {children: [results.name]});
				const description = createVirtualElement('p',{children: [results.description_raw]} );
				// set state game data to results

				this.state.gameData = [
					title,
					description

				];

				updateComponent(this);
			});


		// update gamedate




	}


	createVirtualComponent(props, state){
		return createVirtualElement('main', {
			attributes: {id: 'games', class: 'page'},
			children: [ ...state.gameData ]
		});
	}
}