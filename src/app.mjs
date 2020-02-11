import { createVirtualElement, diff} from './utilities/vdom.mjs';
import Header from './components/header.mjs';
import Component from './utilities/component.mjs';
import ResultList from './components/resultlist.mjs';


class App extends Component {
	createVirtualComponent(){
		return createVirtualElement('div', {
			attributes: { class: 'app' },
			children: [
				createVirtualElement(Header),
				createVirtualElement(ResultList)
			]
		});
	}
}

const render = (vnode, parent) => {
	diff(undefined, undefined, vnode, parent);
};

render(createVirtualElement(App), document.body);
// document.body.appendChild(createSearch());

// // create a search form component with event listener
// // make a function from this
// function createSearch(){
// 	const searchForm = document.createElement('form');
// 	const searchField = document.createElement('input');
// 	const searchSubmit = document.createElement('button');

// 	searchField.setAttribute('type', 'search');
// 	searchField.setAttribute('name', 'searchTerm');
// 	searchSubmit.innerText = 'Search Game';
// 	searchSubmit.setAttribute('type', 'submit');

// 	searchForm.appendChild(searchField);
// 	searchForm.appendChild(searchSubmit);

// 	searchForm.addEventListener('submit', (event) => {
// 		event.preventDefault();
// 		let searchTerm = event.target['searchTerm'].value;
// 		rawgAPI.gameList({search: searchTerm})
// 			.then(showResults)
// 			.catch(error => console.error(error));
// 	});
	
// 	return searchForm;
// }

// function showResults({results}){
// 	results);
// 	// render results and pagination
// }


// fetch results