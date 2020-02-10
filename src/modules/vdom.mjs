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
export function createVirtualElement(tagName, { attributes = {}, children = []} = {}) {
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
export function renderNode(virtualElement) {
	
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


export function renderComponent(component) {
	let renderedComponent = component.render(component.props, component.state);
	component.base = diff(component.base, component.vNode, renderedComponent);
}

export function diff(dom, vNode, vNewNode, parent) {
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
			} else return dom; // both nodes are text with the same value
		}

		if (vNode.tagName !== vNewNode.tagName) {
			// totally different component;

			// new node is a component /class
			if (typeof vNewNode.tagName === 'function') {
				const component = new vNewNode.tagName(vNewNode.props);
				const vNewNode = component.render(component.props, component.state);
				let $newNode = renderNode(vNewNode);
		
				component.base = $newNode;
				component.vNode = vNewNode;
				dom.replaceWith($newNode);
				return $newNode;
			}

			let $newNode = renderNode(vNewNode);
			dom.replaceWith($newNode);
			return $newNode;
		}

		const patchAttrs = diffAttrs(vNode.attributes, vNewNode.attributes);
		const patchChildren = diffChildren(vNode.children, vNewNode.children);

		patchAttrs(dom);
		patchChildren(dom);

		vNode.children = vNewNode.children;
		vNode.attributes = vNewNode.attributes;

		return dom;
		

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

