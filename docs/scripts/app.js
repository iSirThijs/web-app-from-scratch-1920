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
	 * @param {String} tagName - a String with the HTML node
	 * @param {*} [attributes] - the HTML attributes to be set on the node
	 * @param {String} [children] - the children of this node
	 * @returns A virtual element with the given options
	 */
	function createVirtualElement(tagName, { attributes = {}, children = [], events = {}} = {}) {
		const virtualElement = Object.create(null); // this makes the virtualElement pure, by not having a prototype

		Object.assign(virtualElement, {
			tagName,
			attributes,
			children,
			events
		});

		return virtualElement;
	}

	/**
	 * Render the virtual element to a HTML element and text node
	 * @param {Object} virtualElement - the element that needs to be rendered
	 * @returns {*} Either a text node or a html element
	 */
	function renderHTMLElement(virtualElement) {
		
		// The virtual element is a string: return a text node
		if (typeof virtualElement === 'string')	return document.createTextNode(virtualElement);
		
		let {tagName, attributes, children, events} = virtualElement;
		let $element;

		if (typeof tagName === 'string') {
			// The tagname is a 'valid' HTML so using it to render
			$element = document.createElement(tagName);
			
			// set it's attribute
			for (const [key, value] of Object.entries(attributes)) {
				$element.setAttribute(key, value);
			}

			for (const [event, callback] of Object.entries(events)) {
				$element.addEventListener(event, callback);
			}

		} else if(typeof tagName === 'function') {
			const component = new tagName();
			const renderedComponent = component.createVirtualComponent(component.props, component.state);
			$element = renderHTMLElement(renderedComponent);
			
			component.base = $element;
			component.virtualElement = renderedComponent;
		}

		(children || []).forEach(child =>$element.appendChild(renderHTMLElement(child)));

		return $element;
	}


	function updateComponent(component) {
		let virtualComponent = component.createVirtualComponent(component.props, component.state);
		component.base = diff(component.base, component.virtualElement, virtualComponent);
	}

	function diff($element, virtualElement, virtualNewElement, parent) {
		if($element) {

			// console.log($element, virtualElement, virtualNewElement, parent);
			// no new virtual element, old element needs to be removed
			if(!virtualNewElement) {
				$element.remove();
				return undefined;
			}

			// one of the virtual elements is text
			if (typeof virtualNewElement === 'string' || virtualElement === 'string') {
				if(virtualElement !== virtualNewElement) {
					// both string but different value OR one string one element
					// both cases render new node
					let $newNode = renderHTMLElement(virtualNewElement);
					$element.replaceWith($newNode);
					return $newNode;
				} else return $element; // both nodes are text with the same value
			}

			// totally different elements;
			if (virtualElement.tagName !== virtualNewElement.tagName) {

				// new node is a component /class
				if (typeof virtualNewElement.tagName === 'function') {
					const component = new virtualNewElement.tagName(virtualNewElement.props);
					const virtualComponent = component.render(component.props, component.state);
					let $newNode = renderHTMLElement(virtualComponent);
			
					component.base = $newNode;
					component.virtualElement = virtualComponent;
					$element.replaceWith($newNode);
					return $newNode;
				}

				let $newNode = renderHTMLElement(virtualNewElement);
				$element.replaceWith($newNode);
				return $newNode;
			}

			// If the code reaches this, the element is the same, but either its attributes changed or its children need updating (or both)
			const patchAttrs = diffAttrs(virtualElement.attributes, virtualNewElement.attributes);
			const patchChildren = diffChildren(virtualElement.children, virtualNewElement.children);

			patchAttrs($element);
			patchChildren($element);

			// Update the old virtualElement with the updates
			virtualElement.children = virtualNewElement.children;
			virtualElement.attributes = virtualNewElement.attributes;

			return $element;
			

		} else {
			// There is no $element so we append it to the parent
			// this is used to mount the app (or other loose components)
			const newDom = renderHTMLElement(virtualNewElement);
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
				$node.appendChild(renderHTMLElement(additionalVirtualChild));
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
			updateComponent(this);
		}
	}

	class Header extends Component {
		constructor(props) {
			super(props);
		}

		createVirtualComponent(props, state) {
			return createVirtualElement('header', {
				children: [
					createVirtualElement('h1', {children: ['Game Movie Adaption']})
				]
			});
		}
	}

	class ResultCard extends Component {
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

	class ResultList extends Component {
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

	class SearchForm extends Component {
		constructor(props) {
			super(props);
			this.submit = this.submit.bind(this); // allows access to this component instead of the $element
		}

		submit(event){
			event.preventDefault();
			if(event.target[0].value.length >= 1) this.props.setSearchOptions({search: event.target[0].value});
			else alert('please enter a search term');
		}

		createVirtualComponent(props, state){
			return createVirtualElement('form', {
				attributes: { class: 'result-list'},
				events: { submit: this.submit},
				children: [
					createVirtualElement('input', {attributes: { type: 'search'}}),
					createVirtualElement('button', {attributes: { type: 'submit'}, children: ['search']})
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

	class Overview extends Component {
		constructor(props){
			super(props);
			this.state.results= [];
			this.state.search = undefined;
			this.search = new SearchForm({ setSearchOptions: this.setSearchOptions.bind(this)});
			this.resultList = new ResultList(this.state);
		}

		setSearchOptions({search}){
			console.log(search);
			this.state.search = search;
			gameList(this.state).then((data) => this.setResults(data.results));
		}

		setResults(results){
			this.state.results = results;
			updateComponent(this);
		}

		createVirtualComponent(props, state) {
			console.log(props, state);
			return createVirtualElement('main', {
				children: [
					this.search.createVirtualComponent(this.search.props, this.search.state),
					this.resultList.createVirtualComponent(this.state, this.resultList.state.results)
				]
			});
		}
	}

	class App extends Component {
		createVirtualComponent(){
			return createVirtualElement('div', {
				attributes: { class: 'app' },
				children: [
					createVirtualElement(Header),
					createVirtualElement(Overview)
				]
			});
		}
	}

	const render = (vnode, parent) => {
		diff(undefined, undefined, vnode, parent);
	};

	render(createVirtualElement(App), document.body);

})));
//# sourceMappingURL=app.js.map
