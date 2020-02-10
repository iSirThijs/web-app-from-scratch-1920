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
			$element = renderNode(
				component.render(component.props, component.state)
			);

			component.base = $element;
		}

		(children || []).forEach(child =>$element.appendChild(renderNode(child)));

		return $element;
	}


	function renderComponent(component) {
		let renderedComponent = component.render(component.props, component.state);
		component.base = diff(component.base, renderedComponent);
	}

	function diff(oldNode, newNode, parent) {
		// parent)
		if(oldNode) {
			// new node is text
			if (typeof newNode === 'string') {
				oldNode.nodeValue = newNode;
				return oldNode;
			}

			// new node is a component /class
			if (typeof newNode.tagName === 'function') {
				const component = new newNode.tagName(newNode.attrs);
				const rendered = component.render(component.props, component.state);

				diff(oldNode, rendered);
				return oldNode;
			}

			if (newNode.children.length !== oldNode.childNodes.length) {
				oldNode.appendChild(
				// render only the last child
					renderNode(newNode.children[newNode.children.length - 1])
				);
			}

			// run diffing for children
			oldNode.childNodes.forEach((child, i) => diff(child, newNode.children[i]));

			// compare attributes(props)
			// compare children

			return oldNode;
			

		} else {
			// There is no dom
			// virtualNode)
			const newDom = renderNode(newNode);
			parent.appendChild(newDom);
			return newDom;
		}

		// // Both are text nodes or 1 is text and the other is an element
		// if (typeof oldVirtualDom === 'string' || typeof newVirtualDom === 'string') {
		// 	if(oldVirtualDom !== newVirtualDom ) {
		// 		// Both are string but differnet values or 1 is an element
		// 		// In both cases we render
		// 		return $node => {
		// 			const $newNode = renderNode(newVirtualDom);
		// 			$node.replaceWith($newNode);
		// 			return $newNode;
		// 		};
		// 	} else {
		// 		// The nodes are both text/string and have the same value
		// 		return $node => $node;
		// 	}
		// }

		// // Trees are completely different and will the newVirtualDom will be rendered
		// if (oldVirtualDom.tagName !== newVirtualDom.tagName) {
		// 	return $node => {
		// 		const $newNode = renderNode(newVirtualDom);
		// 		$node.replaceWith($newNode);
		// 		return $newNode;
		// 	};
		// }

		// const patchAttrs = diffAttrs(oldVirtualDom.attrs, newVirtualDom.attrs);
		// const patchChildren = diffChildren(oldVirtualDom.children, newVirtualDom.children);

		// return $node => {
		// 	patchAttrs($node);
		// 	patchChildren($node);
		// 	return $node;
		// };
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
			this.state = {text: 'Hello World'};
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

	// import * as rawgAPI from './modules/rawg-api.mjs';



	class App extends Component {
		render(){
			return createVirtualElement('div', {
				attributes: { class: 'app' },
				children: [
					createVirtualElement(Header)
				]
			});
		}
	}

	const render = (vnode, parent) => {
		diff(undefined, vnode, parent);
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
