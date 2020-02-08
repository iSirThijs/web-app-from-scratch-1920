(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}((function () { 'use strict';

	const baseURL = new URL('https://api.rawg.io/');

	/**
	 * @module createVirtualElement
	 */

	/**
	 * Create a new virtual element
	 * @param {String} tagName - a String with the HTML tagname
	 * @param {*} [attrs] - the HTML attributes to be set on the element
	 * @param {String} [children] - the children of this element
	 */
	function createVirtualElement(tagName, { attrs = {}, children = []}) {
		const virtualElement = Object.create(null); // this makes the virtualElement pure, by not having a prototype

		Object.assign(virtualElement, {
			tagName,
			attrs,
			children,
		});

		return virtualElement;
	}

	/**
	 * Render the virtual element
	 * @param {Object} virtualNode - the element that needs to be rendered
	 */
	function renderElement({tagName, attrs, children}) {
		// Create the HTML element
		const $element = document.createElement(tagName);

		// Set the attributes of the elements
		for (const [key, value] of Object.entries(attrs)) {
			$element.setAttribute(key, value);
		}

		// Append the childeren of the element
		for (const child of children) {
			$element.appendChild(render(child));
		}

		return $element;
	}


	function render(virtualElement) {
		if (typeof virtualElement === 'string')	return document.createTextNode(virtualElement);
		else return renderElement(virtualElement);
	}

	function mount($node, $target) {
		$target.replaceWith($node);
		return $node;
	}

	const vApp = createVirtualElement('div', {
		attrs: {
			id: 'app'
		},
		children: [
			'test!'
		]
	});

	const $app = render(vApp);
	mount($app, document.getElementById('app'));


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

})));
