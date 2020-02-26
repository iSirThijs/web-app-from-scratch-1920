(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}((function () { 'use strict';

  /*!
   * routie - a tiny hash router
   * v0.3.2
   * http://projects.jga.me/routie
   * copyright Greg Allen 2016
   * MIT License
  */
  var Routie = function(w, isModule) {

    var routes = [];
    var map = {};
    var reference = "routie";
    var oldReference = w[reference];

    var Route = function(path, name) {
      this.name = name;
      this.path = path;
      this.keys = [];
      this.fns = [];
      this.params = {};
      this.regex = pathToRegexp(this.path, this.keys, false, false);

    };

    Route.prototype.addHandler = function(fn) {
      this.fns.push(fn);
    };

    Route.prototype.removeHandler = function(fn) {
      for (var i = 0, c = this.fns.length; i < c; i++) {
        var f = this.fns[i];
        if (fn == f) {
          this.fns.splice(i, 1);
          return;
        }
      }
    };

    Route.prototype.run = function(params) {
      for (var i = 0, c = this.fns.length; i < c; i++) {
        this.fns[i].apply(this, params);
      }
    };

    Route.prototype.match = function(path, params){
      var m = this.regex.exec(path);

      if (!m) return false;


      for (var i = 1, len = m.length; i < len; ++i) {
        var key = this.keys[i - 1];

        var val = ('string' == typeof m[i]) ? decodeURIComponent(m[i]) : m[i];

        if (key) {
          this.params[key.name] = val;
        }
        params.push(val);
      }

      return true;
    };

    Route.prototype.toURL = function(params) {
      var path = this.path;
      for (var param in params) {
        path = path.replace('/:'+param, '/'+params[param]);
      }
      path = path.replace(/\/:.*\?/g, '/').replace(/\?/g, '');
      if (path.indexOf(':') != -1) {
        throw new Error('missing parameters for url: '+path);
      }
      return path;
    };

    var pathToRegexp = function(path, keys, sensitive, strict) {
      if (path instanceof RegExp) return path;
      if (path instanceof Array) path = '(' + path.join('|') + ')';
      path = path
        .concat(strict ? '' : '/?')
        .replace(/\/\(/g, '(?:/')
        .replace(/\+/g, '__plus__')
        .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function(_, slash, format, key, capture, optional){
          keys.push({ name: key, optional: !! optional });
          slash = slash || '';
          return '' + (optional ? '' : slash) + '(?:' + (optional ? slash : '') + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')' + (optional || '');
        })
        .replace(/([\/.])/g, '\\$1')
        .replace(/__plus__/g, '(.+)')
        .replace(/\*/g, '(.*)');
      return new RegExp('^' + path + '$', sensitive ? '' : 'i');
    };

    var addHandler = function(path, fn) {
      var s = path.split(' ');
      var name = (s.length == 2) ? s[0] : null;
      path = (s.length == 2) ? s[1] : s[0];

      if (!map[path]) {
        map[path] = new Route(path, name);
        routes.push(map[path]);
      }
      map[path].addHandler(fn);
    };

    var routie = function(path, fn) {
      if (typeof fn == 'function') {
        addHandler(path, fn);
        routie.reload();
      } else if (typeof path == 'object') {
        for (var p in path) {
          addHandler(p, path[p]);
        }
        routie.reload();
      } else if (typeof fn === 'undefined') {
        routie.navigate(path);
      }
    };

    routie.lookup = function(name, obj) {
      for (var i = 0, c = routes.length; i < c; i++) {
        var route = routes[i];
        if (route.name == name) {
          return route.toURL(obj);
        }
      }
    };

    routie.remove = function(path, fn) {
      var route = map[path];
      if (!route)
        return;
      route.removeHandler(fn);
    };

    routie.removeAll = function() {
      map = {};
      routes = [];
    };

    routie.navigate = function(path, options) {
      options = options || {};
      var silent = options.silent || false;

      if (silent) {
        removeListener();
      }
      setTimeout(function() {
        window.location.hash = path;

        if (silent) {
          setTimeout(function() { 
            addListener();
          }, 1);
        }

      }, 1);
    };

    routie.noConflict = function() {
      w[reference] = oldReference;
      return routie;
    };

    var getHash = function() {
      return window.location.hash.substring(1);
    };

    var checkRoute = function(hash, route) {
      var params = [];
      if (route.match(hash, params)) {
        route.run(params);
        return true;
      }
      return false;
    };

    var hashChanged = routie.reload = function() {
      var hash = getHash();
      for (var i = 0, c = routes.length; i < c; i++) {
        var route = routes[i];
        if (checkRoute(hash, route)) {
          return;
        }
      }
    };

    var addListener = function() {
      if (w.addEventListener) {
        w.addEventListener('hashchange', hashChanged, false);
      } else {
        w.attachEvent('onhashchange', hashChanged);
      }
    };

    var removeListener = function() {
      if (w.removeEventListener) {
        w.removeEventListener('hashchange', hashChanged);
      } else {
        w.detachEvent('onhashchange', hashChanged);
      }
    };
    addListener();

    if (isModule){
      return routie;
    } else {
      w[reference] = routie;
    }
     
  };

  if (typeof module == 'undefined'){
    Routie(window);
  } else {
    module.exports = Routie(window,true);
  }

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

  // Event listener for back link
  const previousPage = (event) => {
  	event.preventDefault();
  	window.history.back();
  };

  // creates a li with an link to the previous page
  const backLink = createVirtualElement('li', {
  	children: [ 
  		createVirtualElement('a', { 
  			attributes: { href: '#' }, 
  			events: { 'click': previousPage }, 
  			children: ['Back'] })
  	]
  });

  // creates a li with link to a page
  const createPageLink = (link) => {
  	return createVirtualElement('li', { 
  		children: [ 
  			createVirtualElement('a', {
  				attributes: { href: `#${link}` }, 
  				children: [link]
  			})
  		]});
  };

  // creates the links in the navbar
  const links = (links) => {
  	return [ 
  		backLink, 
  		...links.map(createPageLink)
  	];
  };


  class Nav extends Component {
  	constructor(props) {
  		super(props);
  	}

  	createVirtualComponent(props, state) {
  		return createVirtualElement('nav', {
  			children: [
  				createVirtualElement('ul', {
  					children: links(props.pages)
  				}),
  				// nav bar
  			]
  		});
  	}
  }

  // Creates a nav bar based on the pages
  const nav = (hash, pages) => { 
  	let newNav = new Nav({hash, pages});
  	return newNav.createVirtualComponent(newNav.props, newNav.state);
  };

  class Header extends Component {
  	constructor(props) {
  		super(props);
  	}

  	createVirtualComponent(props, state) {
  		return createVirtualElement('header', {
  			children: [
  				createVirtualElement('h1', {children: ['Game Explorer']}),
  				nav(props.hash, props.pages)
  			]});
  	}
  }

  // Creates the header
  const header = (hash, pages) => {
  	const header = new Header({hash, pages});
  	return header.createVirtualComponent(header.props, header.state);
  };


  class App extends Component {
  	constructor(props) {
  		super(props);
  		// Page
  		this.state.hash = props.hash;
  		this.state.page = props.page;

  		// create the virtualElement and HTML element
  		this.virtualElement = this.createVirtualComponent(this.props, this.state);
  		this.base = renderHTMLElement(this.virtualElement);
  	}

  	changePage([hash, page]){
  		// changes the page and start diffing
  		this.state.hash = hash;
  		this.state.page = page;
  		updateComponent(this);
  	}

  	createVirtualComponent(props, state){
  		return createVirtualElement('div', {
  			attributes: { class: 'app' },
  			children: [
  				header(state.hash, props.pages),
  				createVirtualElement(state.page)
  			]
  		});
  	}
  }

  class Home extends Component {
  	createVirtualComponent(){
  		return createVirtualElement('main', { 
  			children: [
  				// 
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

  class Form extends Component {
  	constructor(props) {
  		super(props);
  		this.input = this.input.bind(this); // allows access to this component instead of the $element
  	}

  	input(event){
  		this.props.setSearchQuery(event.target.value);
  	}

  	createVirtualComponent(props, state){
  		return createVirtualElement('form', {
  			attributes: { class: 'result-list'},
  			// events: { submit: this.submit},
  			children: [
  				createVirtualElement('input', {
  					attributes: { type: 'text'}, 
  					events: { input: this.input }
  				})
  			]
  		});
  	}

  }

  class Component$1 {
  	constructor(props) {
  		this.props = props;
  		this.state = {};
  	}

  	setState(state) {
  		this.state = Object.assign({}, state);
  		updateComponent(this);
  	}
  }

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
  function createVirtualElement$1(tagName, { attributes = {}, children = [], events = {}} = {}) {
  	const virtualElement = Object.create(null); // this makes the virtualElement pure, by not having a prototype

  	Object.assign(virtualElement, {
  		tagName,
  		attributes,
  		children,
  		events
  	});

  	return virtualElement;
  }

  class ResultCard extends Component$1 {
  	constructor(props) {
  		super(props);
  	}

  	createVirtualComponent(props, state) {
  		return createVirtualElement$1('article', {
  			attributes: { id: props.id },
  			children: [
  				createVirtualElement$1('h3', {
  					children: [props.name]
  				})
  			]
  		});
  	}
  }

  class GameList extends Component$1 {
  	constructor(props) {
  		super(props);
  	}

  	createVirtualComponent(props, state){
  		return createVirtualElement$1('div', {
  			attributes: { class: 'result-list'},
  			children: [...props.results.map((result => {
  				let resultCard = new ResultCard(result);
  				return resultCard.createVirtualComponent(resultCard.props, resultCard.state);
  			}))]
  		});
  	}

  }

  function transformToResultList(data) {
  	return data.results.map((result) => {
  		let { id, slug, name } = result;
  		return { id, slug, name };
  	});
  }

  class Search extends Component {
  	constructor(props){
  		super(props);

  		this.state.apiQueryParams = {
  			page_size: 10
  		};

  		this.state.results = [];

  		this.form = new Form({setSearchQuery: this.setSearchQuery.bind(this)});
  		this.gameList = new GameList({results: this.state.results});

  	}

  	setSearchQuery(query) {
  		if(query.length < 3) {
  			this.state.results = [];
  			updateComponent(this);
  		}
  		else {
  			this.state.apiQueryParams.search = query;
  			this.getResults(this.state.apiQueryParams);
  		}

  	}

  	getResults(params) {
  		gameList(params)
  			.then(transformToResultList) 
  			.then((gameList) => {
  				this.state.results = gameList;
  				updateComponent(this);
  			});
  	}


  	// setSearchOptions({search}){
  	// 	this.state.search = search;
  	// 	rawgAPI.gameList(this.state).then((data) => this.setResults(data.results));
  	// }

  	createVirtualComponent(props, state){
  		let { form, gameList } = this;
  		return createVirtualElement('main', { 
  			children: [
  				form.createVirtualComponent(form.props, form.state),
  				gameList.createVirtualComponent(state, gameList.state)
  			]
  		});
  	}
  }

  // attach the app to the dom
  const render = ($element, parent) => {
  	parent.appendChild($element);
  };
  // Props for the app
  const props = {
  	pages: ['Home', 'Search'],
  	hash: 'Home',
  	page: Home
  };

  const app = new App(props); // Creates the app with the props

  render(app.base, document.body); // first time render (home is default state)

  routie({
  	'home': () => app.changePage(['Home', Home]),
  	'search': () => app.changePage(['Search', Search])
  });

  // routie('home'); // sets the page at home

})));
//# sourceMappingURL=main.js.map
