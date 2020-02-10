(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}((function () { 'use strict';

	/**
	 * @module vdom Utilities for creating elements and usage with virtual dom
	 * based on: 
	 * https://dev.to/ycmjason/building-a-simple-virtual-dom-from-scratch-3d05
	 * https://medium.com/@aibolkussain/create-your-own-virtual-dom-to-understand-it-part-1-47b9b6fc6dfb
	 * https://medium.com/@aibolkussain/create-your-own-virtual-dom-to-understand-it-part-2-c85c4ffd15f0
	 */

	/**
	 * Create a new virtual element
	 * @param {String} tagName - a String with the HTML tagname
	 * @param {*} [attributes] - the HTML attributes to be set on the element
	 * @param {String} [children] - the children of this element
	 * @returns A virtual element with the given options
	 */
	function createVirtualElement(tagName, { attributes = {}, children = []} = {}) {
		// children)
		const virtualElement = Object.create(null); // this makes the virtualElement pure, by not having a prototype

		Object.assign(virtualElement, {
			tagName,
			attributes,
			children,
		});

		return virtualElement;
	}

	/**
	 * Render the virtual element or a text node
	 * @param {Object} virtualElement - the element that needs to be rendered
	 * @returns {*} Either a text node or a html element
	 */
	function renderNode(virtualElement) {
		
		if (typeof virtualElement === 'string')	return document.createTextNode(virtualElement);
		
		let {tagName, attributes, children} = virtualElement;
		let $element;

		if (typeof tagName === 'string') {
			$element = document.createElement(tagName);
			
			for (const [key, value] of Object.entries(attributes)) {
				$element.setAttribute(key, value);
			} 
		} else if(typeof tagName === 'function') {
			const component = new tagName();
			const renderedComponent = component.render(component.props, component.state);
			$element = renderNode(renderedComponent);
			
			component.base = $element;
			component.vNode = renderedComponent;
		}

		(children || []).forEach(child =>$element.appendChild(renderNode(child)));

		return $element;
	}


	function renderComponent(component) {
		let renderedComponent = component.render(component.props, component.state);
		component.base = diff(component.base, component.vNode, renderedComponent);
	}

	function diff(dom, vNode, vNewNode, parent) {
		// console.log(dom, vNode, vNewNode);
		if(dom) {
			// no new node, old node needs removal
			if(!vNewNode) {
				dom.remove();
				return undefined;
			}
			// one of the nodes is text
			if (typeof vNewNode === 'string' || vNode === 'string') {
				if(vNode !== vNewNode) {
					// both string but different value OR one string one element
					// both cases render new node
					let $newNode = renderNode(vNewNode);
					dom.replaceWith($newNode);
					return $newNode;
				} else return vNode; // both nodes are text with the same value
			}

			if (vNode.tagName !== vNewNode.tagName) {
				// totally different components

				// new node is a component /class
				if (typeof vNewNode.tagName === 'function') {
					const component = new vNewNode.tagName(vNewNode.props);
					const vNewNode = component.render(component.props, component.state);
				}

				let $newNode = renderNode(vNewNode);
				dom.replaceWith($newNode);
			}

			const patchAttrs = diffAttrs(vNode.attributes, vNewNode.attributes);
			const patchChildren = diffChildren(vNode.children, vNewNode.children);

			patchAttrs(dom);
			patchChildren(dom);


			return vNode;
			

		} else {
			// There is no dom
			const newDom = renderNode(vNewNode);
			parent.appendChild(newDom);
			return newDom;
		}
	}

	function diffAttrs(oldAttrs, newAttrs) {
		const patches = [];

		// setting new attributes
		for(const [key, value] of Object.entries(newAttrs)) {
			patches.push($node => {
				$node.setAttribute(key, value);
				return $node;
			});
		}

		// removing old attrs
		for (const key in oldAttrs){
			if(!(key in newAttrs)) {
				patches.push($node => {
					$node.removeAttribute(key);
					return $node;
				});
			}
		}

		return $node => {
			for(const patch of patches){
				patch($node);
			}
			return $node;
		};
	}

	function diffChildren(oldVirtualChildren, newVirtualChildren) {
		
		const childPatches = [];
		oldVirtualChildren.forEach((oldVirtualChild, i) => {
			childPatches.push(($node) => diff($node, oldVirtualChild, newVirtualChildren[i]));
		});

		const additionalPatches = [];
		for (const additionalVirtualChild of newVirtualChildren.slice(oldVirtualChildren.length)) {
			additionalPatches.push($node => {
				$node.appendChild(renderNode(additionalVirtualChild));
				return $node;
			});
		}

		return $parent => {
			for (const patch of additionalPatches){
				patch($parent);
			}

			for (const [patch, $child] of zip(childPatches, $parent.childNodes)) {
				patch($child);
			}

			return $parent;
		};
	}

	function zip(xs, ys) {
		const zipped = [];
		for (let i = 0; i < Math.min(xs.length, ys.length); i++) {
			zipped.push([xs[i], ys[i]]);
		}
		return zipped;
	}

	class Component {
		constructor(props) {
			this.props = props;
			this.state = {};
		}

		setState(state) {
			this.state = Object.assign({}, state);
			renderComponent(this);
		}
	}

	class Header extends Component {
		constructor(props) {
			super(props);
			this.state.text = 'Hello World';
			this.timer = setTimeout(() => {
				this.setState({text: 'welcome back' });
			}, 5000);
		}

		render(props, state) {
			return createVirtualElement('header', {
				children: [
					createVirtualElement('h1', {children: ['Game Movie Adaption']}),
					createVirtualElement('p', {children: [state.text]})
				]
			});
		}
	}

	class ResultCard extends Component {
		constructor(props) {
			super(props);
			this.state = props;
		}

		render(props, state) {
			return createVirtualElement('article', {
				attributes: { id: state.id },
				children: [
					createVirtualElement('h3', {
						children: [state.name]
					})
				]
			});
		}
	}

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

	// This uses the URL Api : https://developer.mozilla.org/en-US/docs/Web/API/URL/URL
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

	class ResultList extends Component {
		constructor(props) {
			super(props);
			this.state.data = [];
			this.data = setTimeout(() => {
				gameList()
					.then(data => {
						this.setState({data: [...data.results]});
						// this.setState(data.result);
					}).catch(console.error);
			},0);
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

	class App extends Component {
		render(){
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

})));
