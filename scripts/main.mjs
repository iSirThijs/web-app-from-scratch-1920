import * as rawgAPI from './modules/rawg-api.mjs';

document.body.appendChild(createSearch());

// create a search form component with event listener
// make a function from this
function createSearch(){
	const searchForm = document.createElement('form');
	const searchField = document.createElement('input');
	const searchSubmit = document.createElement('button');

	searchField.setAttribute('type', 'search');
	searchField.setAttribute('name', 'searchTerm');
	searchSubmit.innerText = 'Search Game';
	searchSubmit.setAttribute('type', 'submit');

	searchForm.appendChild(searchField);
	searchForm.appendChild(searchSubmit);

	searchForm.addEventListener('submit', (event) => {
		event.preventDefault();
		let searchTerm = event.target['searchTerm'].value;
		rawgAPI.gameList({search: searchTerm})
			.then(showResults)
			.catch(error => console.error(error));
	});
	
	return searchForm;
}

function showResults({results}){
	console.log(results);
	// render results and pagination
}


// fetch results