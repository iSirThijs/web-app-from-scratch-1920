import Component from '../utilities/component.mjs';
import { createVirtualElement } from '../utilities/vdom.mjs';

export class ResultCard extends Component {
	constructor(props) {
		super(props);
	}

	createVirtualComponent(props, state) {
		return createVirtualElement('article', {
			attributes: { id: props.id },
			children: [
				createVirtualElement('h3', {
					children: [props.name]
				})
			]
		});
	}
}

export default class GameList extends Component {
	constructor(props) {
		super(props);
	}

	createVirtualComponent(props, state){
		return createVirtualElement('div', {
			attributes: { class: 'result-list'},
			children: [...props.results.map((result => {
				let resultCard = new ResultCard(result);
				return resultCard.createVirtualComponent(resultCard.props, resultCard.state);
			}))]
		});
	}

}