import Component from '../modules/component.mjs';
import { createVirtualElement } from '../modules/vdom.mjs';
import ResultCard from './resultcard.mjs';
import * as rawgAPI from '../modules/rawg-api.mjs';


export default class ResultList extends Component {
	constructor(props) {
		super(props);
		this.state.data = [];
		this.timer1 = setTimeout(() => {
			rawgAPI.gameList()
				.then(data => {
					this.setState({data: [...data.results]});
					// this.setState(data.result);
				}).catch(console.error);
		},0);
		this.timer2 = setTimeout(() => {
			rawgAPI.gameList({search: 'tomb raider'})
				.then(data => {
					this.setState({data: [...data.results]});
					// this.setState(data.result);
				}).catch(console.error);
		},10000);
	}

	render(props, state){
		// console.log(state);
		return createVirtualElement('div', {
			attributes: { class: 'result-list'},
			children: [...state.data.map((result => {
				let resultCard = new ResultCard(result);
				return resultCard.render(resultCard.props, resultCard.state);
			}))]
		});
	}

}

