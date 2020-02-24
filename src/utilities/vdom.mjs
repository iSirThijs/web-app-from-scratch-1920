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
export function createVirtualElement(tagName, { attributes = {}, children = [], events = {}} = {}) {
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
export function renderHTMLElement(virtualElement) {
	
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


export function updateComponent(component) {
	let virtualComponent = component.createVirtualComponent(component.props, component.state);
	component.base = diff(component.base, component.virtualElement, virtualComponent);
}


export function diff($element, virtualElement, virtualNewElement, parent) {
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
				const virtualComponent = component.createVirtualComponent(component.props, component.state);
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

