import Component from '../utilities/component.mjs';
import { createVirtualElement } from '../utilities/vdom.mjs';
import ResultCard from './resultcard.mjs';


export default class ResultList extends Component {
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