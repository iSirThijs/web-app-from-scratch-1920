import * as rawgAPI from './modules/rawg-api.mjs';
import {createVirtualElement, render, mount, diff} from './modules/vdom.mjs';


import header from './components/header.mjs';

const app = text => createVirtualElement('div', {
	attrs: {
		id: 'app'
	},
	children: [
		header,
		text
	]
});

let vApp = app('hello!!');
const $app = render(vApp);
let $rootEl = mount($app, document.getElementById('app'));


setTimeout(() => {
	const vNewApp = app('world!!');
	const patch = diff(vApp, vNewApp);

	console.log(vNewApp);
	console.log(patch);
	
	$rootEl = patch($rootEl);

	vApp = vNewApp;
}, 5000);




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
// 	console.log(results);
// 	// render results and pagination
// }


// fetch results