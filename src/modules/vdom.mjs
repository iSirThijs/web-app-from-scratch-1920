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
		$element = renderNode(
			component.render(component.props, component.state)
		);

		component.base = $element;
	}

	(children || []).forEach(child =>$element.appendChild(renderNode(child)));

	return $element;
}


export function renderComponent(component) {
	let renderedComponent = component.render(component.props, component.state);
	component.base = diff(component.base, renderedComponent);
}

export function diff(oldNode, newNode, parent) {
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
			$node.appendChild(renderNode(newVirtualChildren));
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

