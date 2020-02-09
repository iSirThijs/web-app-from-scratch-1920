(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}((function () { 'use strict';

	const baseURL = new URL('https://api.rawg.io/');

	/**
	 * @module vdom Utilities for creating elements and usage with virtual dom
	 * based on: https://dev.to/ycmjason/building-a-simple-virtual-dom-from-scratch-3d05
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
	 * Render the virtual element
	 * @param {String} tagName - a String with the HTML tagname
	 * @param {*} [attrs] - the HTML attributes to be set on the element
	 * @param {String} [children] - the children of this element
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

	/**
	 * Render the virtual element or a text node
	 * @param {Object} virtualElement - the element that needs to be rendered
	 * @returns {*} Either a text node or a html element
	 */
	function render(virtualElement) {
		if (typeof virtualElement === 'string')	return document.createTextNode(virtualElement);
		else return renderElement(virtualElement);
	}

	function mount($node, $target) {
		$target.replaceWith($node);
		return $node;
	}

	function diff(oldVirtualDom, newVirtualDom) {
		// oldVirtualDom doesn't exist
		if (!newVirtualDom) {
			return $node => {
				$node.remove();
				return undefined;
			};
		}

		// Both are text nodes or 1 is text and the other is an element
		if (typeof oldVirtualDom === 'string' || typeof newVirtualDom === 'string') {
			if(oldVirtualDom !== newVirtualDom ) {
				// Both are string but differnet values or 1 is an element
				// In both cases we render
				return $node => {
					const $newNode = render(newVirtualDom);
					$node.replaceWith($newNode);
					return $newNode;
				};
			} else {
				// The nodes are both text/string and have the same value
				return $node => $node;
			}
		}

		// Trees are completely different and will the newVirtualDom will be rendered
		if (oldVirtualDom.tagName !== newVirtualDom.tagName) {
			return $node => {
				const $newNode = render(newVirtualDom);
				$node.replaceWith($newNode);
				return $newNode;
			};
		}

		const patchAttrs = diffAttrs(oldVirtualDom.attrs, newVirtualDom.attrs);
		const patchChildren = diffChildren(oldVirtualDom.children, newVirtualDom.children);

		return $node => {
			patchAttrs($node);
			patchChildren($node);
			return $node;
		};
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
			childPatches.push(diff(oldVirtualChild, newVirtualChildren[i]));
		});

		const additionalPatches = [];
		for (const additionalVirtualChild of newVirtualChildren.slice(oldVirtualChildren.length)) {
			additionalPatches.push($node => {
				$node.appendChild(render(newVirtualChildren));
				return $node;
			});
		}

		return $parent => {
			for (const [patch, $child] of zip(childPatches, $parent.childNodes)) {
				patch($child);
			}

			for (const patch of additionalPatches){
				patch($parent);
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

	const h1 = createVirtualElement('h1', {
		children: ['Game - Movie adaptions']
	});


	const header = createVirtualElement('header', {
		attrs: {},
		children: [
			h1
		]
	});

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

})));
