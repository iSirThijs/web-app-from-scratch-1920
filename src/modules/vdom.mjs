/**
 * @module createVirtualElement
 */

/**
 * Create a new virtual element
 * @param {String} tagName - a String with the HTML tagname
 * @param {*} [attrs] - the HTML attributes to be set on the element
 * @param {String} [children] - the children of this element
 */
export function createVirtualElement(tagName, { attrs = {}, children = []}) {
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
export function renderElement({tagName, attrs, children}) {
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


export function render(virtualElement) {
	if (typeof virtualElement === 'string')	return document.createTextNode(virtualElement);
	else return renderElement(virtualElement);
}

export function mount($node, $target) {
	$target.replaceWith($node);
	return $node;
}