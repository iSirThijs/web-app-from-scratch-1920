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
	 * @param {*} [attrs] - the HTML attributes to be set on the element
	 * @param {String} [children] - the children of this element
	 * @returns A virtual element with the given options
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
	 * Render the virtual element or a text node
	 * @param {Object} virtualElement - the element that needs to be rendered
	 * @returns {*} Either a text node or a html element
	 */
	function renderNode(virtualElement) {
		if (typeof virtualElement === 'string')	return document.createTextNode(virtualElement);
		
		let {tagName, attrs, children} = virtualElement;
		let $element;

		
		if (typeof tagName === 'string') {
			$element = document.createElement(tagName);
			
			for (const [key, value] of Object.entries(attrs)) {
				$element.setAttribute(key, value);
			}
		} else if(typeof virtualElement === 'function') {
			const component = new virtualElement(attrs);
			$element = renderNode(
				component.render(component.props, component.state)
			);

			component.base = $element;
		}
		// children
		if (children) children.forEach(child => $element.appendChild(renderNode(child)));

		return $element;
	}


	function renderComponent(component, parent) {
		const oldBase = component.base;
		component.base = renderNode(
			component.render(component.props, component.state)
		);

		if(parent) parent.appendChild(component.base);
		else oldBase.parentNode.replaceChild(component.base, oldBase);
	}

	// export function diff(oldVirtualDom, newVirtualDom) {
	// 	// oldVirtualDom doesn't exist
	// 	if (!newVirtualDom) {
	// 		return $node => {
	// 			$node.remove();
	// 			return undefined;
	// 		};
	// 	}

	// 	// Both are text nodes or 1 is text and the other is an element
	// 	if (typeof oldVirtualDom === 'string' || typeof newVirtualDom === 'string') {
	// 		if(oldVirtualDom !== newVirtualDom ) {
	// 			// Both are string but differnet values or 1 is an element
	// 			// In both cases we render
	// 			return $node => {
	// 				const $newNode = renderNode(newVirtualDom);
	// 				$node.replaceWith($newNode);
	// 				return $newNode;
	// 			};
	// 		} else {
	// 			// The nodes are both text/string and have the same value
	// 			return $node => $node;
	// 		}
	// 	}

	// 	// Trees are completely different and will the newVirtualDom will be rendered
	// 	if (oldVirtualDom.tagName !== newVirtualDom.tagName) {
	// 		return $node => {
	// 			const $newNode = renderNode(newVirtualDom);
	// 			$node.replaceWith($newNode);
	// 			return $newNode;
	// 		};
	// 	}

	// 	const patchAttrs = diffAttrs(oldVirtualDom.attrs, newVirtualDom.attrs);
	// 	const patchChildren = diffChildren(oldVirtualDom.children, newVirtualDom.children);

	// 	return $node => {
	// 		patchAttrs($node);
	// 		patchChildren($node);
	// 		return $node;
	// 	};
	// }

	// function diffAttrs(oldAttrs, newAttrs) {
	// 	const patches = [];

	// 	// setting new attributes
	// 	for(const [key, value] of Object.entries(newAttrs)) {
	// 		patches.push($node => {
	// 			$node.setAttribute(key, value);
	// 			return $node;
	// 		});
	// 	}

	// 	// removing old attrs
	// 	for (const key in oldAttrs){
	// 		if(!(key in newAttrs)) {
	// 			patches.push($node => {
	// 				$node.removeAttribute(key);
	// 				return $node;
	// 			});
	// 		}
	// 	}

	// 	return $node => {
	// 		for(const patch of patches){
	// 			patch($node);
	// 		}
	// 		return $node;
	// 	};
	// }

	// function diffChildren(oldVirtualChildren, newVirtualChildren) {
	// 	const childPatches = [];
	// 	oldVirtualChildren.forEach((oldVirtualChild, i) => {
	// 		childPatches.push(diff(oldVirtualChild, newVirtualChildren[i]));
	// 	});

	// 	const additionalPatches = [];
	// 	for (const additionalVirtualChild of newVirtualChildren.slice(oldVirtualChildren.length)) {
	// 		additionalPatches.push($node => {
	// 			$node.appendChild(renderNode(newVirtualChildren));
	// 			return $node;
	// 		});
	// 	}

	// 	return $parent => {
	// 		for (const [patch, $child] of zip(childPatches, $parent.childNodes)) {
	// 			patch($child);
	// 		}

	// 		for (const patch of additionalPatches){
	// 			patch($parent);
	// 		}

	// 		return $parent;
	// 	};
	// }

	// function zip(xs, ys) {
	// 	const zipped = [];
	// 	for (let i = 0; i < Math.min(xs.length, ys.length); i++) {
	// 		zipped.push([xs[i], ys[i]]);
	// 	}
	// 	return zipped;
	// }

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
			this.state = {};
		}

		render(props, state) {
			return createVirtualElement('header', {
				children: [
					createVirtualElement('h1', {children: ['Game Movie Adaption']}),
				]
			});
		}
	}

	// import * as rawgAPI from './modules/rawg-api.mjs';



	class App extends Component {
		render(){
			return createVirtualElement('div', {
				attrs: { class: 'app' },
				children: [
					Header,
					createVirtualElement('p', {children: ['Hello World']} )
				]
			});
		}
	}

	renderComponent(new App(), document.body);




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
