(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}((function () { 'use strict';

	/* 
	 * Module to append fetch with some additional modules
	 * based on https://codeburst.io/fetch-api-was-bringing-darkness-to-my-codebase-so-i-did-something-to-illuminate-it-7f2d8826e939
	 */

	/**
	 * Checks if the response is 'ok'
	 * @param {*} response - the response object from a fetch request
	 * @returns {Promise<*>} if response is ok, resolves with the response. Else rejects with an error
	 */
	const checkStatus = response => {
		if (response.ok) return response;
		else {
			const error = new Error(response.statusText || response.status);
			error.response = response;
			throw error;
		}
	};

	/**
	 * Parses a response to JSON
	 * @param {*} response - the response object from a fetch request
	 * @returns {Promise<*>} the parsed response object
	 */
	const parseJSON = res => res.json();

	/**
	 * Fetch with added utilities like check for status code and json parse
	 * @param {string} url - the url for this get request
	 * @param {*} [init] - An object containing any custom settings that you want to apply to the request
	 * @returns {Promise<*>} The resolved JSON parsed response if 200 Ok or rejection with the error reason
	 */
	function get(url, init) {
		return fetch(url, init)
			.then(checkStatus)
			.then(parseJSON);
	}

	const baseURL = new URL('https://api.rawg.io/');

	/**
	 * Get a list of games
	 * @param {String[]} [params] - An array of string with search queries, without the results will be random
	 * @returns {Promise<*>} - A resolved promise with the results of the query or an rejection with the error reason
	 */
	function gameList(params) {

		const gamesURL = new URL('/api/games', baseURL);
		const searchParams = new URLSearchParams(params);

		if (params) gamesURL.search = searchParams;

		return get(gamesURL);

	}

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
			gameList({search: searchTerm})
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

})));
