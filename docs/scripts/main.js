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
  function createVirtualElement(tagName, { props = {}, attributes = {}, children = [], events = {}} = {}) {
  	const virtualElement = Object.create(null); // this makes the virtualElement pure, by not having a prototype

  	Object.assign(virtualElement, {
  		tagName,
  		attributes,
  		children,
  		events,
  		props
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
  	
  	let {tagName, attributes, children, events, props} = virtualElement;
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
  		const component = new tagName(props);
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


  function diff($element, virtualElement, virtualNewElement) {
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

  class EasySearchForm extends Component {
  	constructor(props){
  		super(props);
  		this.props.input = (event) => {
  			// creates a tiny delay on typing
  			if (this.typingTimer)clearTimeout(this.typingTimer); 
  			this.typingTimer = setTimeout(() => props.parent.apiQueryState = event.target.value, 500 );
  		};
  	}

  	createVirtualComponent(props, state) {
  		return createVirtualElement('form', {
  			events: {'submit': (event) => event.preventDefault()},
  			children: [
  				createVirtualElement('input', {attributes: {type: 'text', placeholder: 'search for a game, tag or person'}, events: {input: props.input}}),
  				// createVirtualElement('button', {attributes: {type: 'submit'}, children: ['Search'], events: {'submit': (event) => event.preventDefault()}})
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
   * Get a list of games/developers/creators/
   * @param {Stirng} [endpoint] - A stirng with the endpoint
   * @param {String[]} [params] - An array of string with search queries, without the results will be random
   * @returns {Promise<*>} - A resolved promise with the results of the query or an rejection with the error reason
   */
  function list(endpoint, params) {

  	const gamesURL = new URL(`/api/${endpoint}`, baseURL);
  	const searchParams = new URLSearchParams(params);

  	if (params) gamesURL.search = searchParams;

  	return get(gamesURL);

  }
  /**
   * Get a list of games/developers/creators/
   * @param {Stirng} [endpoint] - A stirng with the endpoint
   * @param {String[]} [params] - An array of string with search queries, without the results will be random
   * @returns {Promise<*>} - A resolved promise with the results of the query or an rejection with the error reason
   */
  function gameDetails(id) {

  	const gamesURL = new URL(`/api/games/${id}`, baseURL);
  	
  	return get(gamesURL);

  }

  class EasySearchResult extends Component {
  	constructor(props){
  		super(props);
  		this.props.class = ['easy-search-result', props.category ];
  		this.state.result = createVirtualElement('div', {children: ['loading...']});

  		this.getApiResults(this.props, this.state);
  	}

  	getApiResults(props, state){
  		list(props.category, props.apiQuery)
  			.then((list) => list.results)
  			.then((results) => {
  				
  				let list = createVirtualElement('ul', {
  					children:  [
  						...results.map((result) => {
  							return createVirtualElement('li', {
  								children: [
  									createVirtualElement('a', {
  										attributes: { href: `#${props.category}/${result.slug}`},
  										children: [ createVirtualElement('h4', {children: [result.name]})]
  									})
  								]
  							});
  						})
  					]
  				});

  				this.state.result = list;
  				updateComponent(this);
  			});// save data in state
  	}



  	createVirtualComponent(props, state){
  		return createVirtualElement('div', {
  			attributes: { class: props.class.join(' ')},
  			children: [
  				createVirtualElement('h3', {children: [ props.category ]}),
  				state.result
  			]
  		});
  	}

  }

  // nav component
  class EasySearch extends Component {
  	constructor(props) {
  		super(props);
  		this.props = {};


  		// categories are the endpoint where you can search with a query
  		this.props.categories = ['games' ]; 
  		this.props.id = 'easy-search';
  		this.state.apiQuery = {
  			search: undefined,
  			page_size: 5
  		};

  		this.state.results = [createVirtualElement('div', { attributes: {class: 'search-info hidden'}, children: ['Start typing to search']})];

  	}

  	set apiQueryState(search) {
  		this.state.apiQuery.search = search;
  		if( search.length == 0 ) this.results = [createVirtualElement('div', { attributes: {class: 'search-info hidden'}, children: ['Start typing to search']})];
  		if( search.length > 0 && search.length < 3) this.results = [createVirtualElement('div', { attributes: {class: 'search-info hidden'}, children: ['Keep typing to search']})];
  		else if(search.length >= 3) {
  			this.results = [];
  			this.results = this.props.categories.map((category) =>{
  				return createVirtualElement(EasySearchResult, { 
  					props: { 
  						category: category,
  						apiQuery: this.state.apiQuery 
  					}
  				});
  			});
  		}
  	}

  	set results(results) {
  		this.state.results = results;
  		updateComponent(this);
  	}

  	createVirtualComponent(props, state) {
  		return createVirtualElement('div', {
  			attributes: { id: props.id },
  			children: [
  				createVirtualElement(EasySearchForm, {props: {parent: this}}),
  				...state.results
  			]
  		});
  	}
  }

  const headerDefaults = {
  	siteTitle: 'Game Explorer'
  };


  class Header extends Component {
  	constructor(props){
  		super(headerDefaults);
  	
  	}

  	createVirtualComponent(props, state) {
  		return createVirtualElement('header', {
  			children: [
  				createVirtualElement('h1', { children: [props.siteTitle]}),
  				createVirtualElement(EasySearch)
  			]
  		});

  	}
  }

  const page = (page, state) => {
  	// console.log(page, state);
  	if (!page) return createVirtualElement('main');
  	else return createVirtualElement(page, {props: state});
  };


  class App extends Component {
  	constructor(props) {
  		super();
  		// Page
  		this.state = props;
  		this.virtualElement = this.createVirtualComponent(this.props, this.state);
  		this.base = renderHTMLElement(this.virtualElement);
  	
  	}

  	changePage(state){
  		this.setState({});
  		this.setState(state);
  		updateComponent(this);
  	}

  	createVirtualComponent(props, state){
  		// console.log(props, state)
  		return createVirtualElement('div', {
  			attributes: { class: 'app' },
  			children: [
  				createVirtualElement(Header),
  				page(state.page, {slug: state.slug})
  			]
  		});
  	}
  }

  class Home extends Component {
  	createVirtualComponent(props, state){
  		return createVirtualElement('main', {
  			attributes: {id: 'home', class: 'page'}
  		});
  	}
  }

  class Games extends Component {
  	constructor(props) {
  		super(props);
  		this.state.gameData = [createVirtualElement('div', {children: ['loading...']})];
  		// kick off api get
  		this.getGameDetailData(this.props.slug);
  	}

  	getGameDetailData(slug) {
  		// query api
  		gameDetails(slug)
  			.then((results) => {
  				const title = createVirtualElement('h2', {children: [results.name]});
  				const description = createVirtualElement('p',{children: [results.description_raw]} );
  				// set state game data to results

  				this.state.gameData = [
  					title,
  					description

  				];

  				updateComponent(this);
  			});


  		// update gamedate




  	}


  	createVirtualComponent(props, state){
  		return createVirtualElement('main', {
  			attributes: {id: 'games', class: 'page'},
  			children: [ ...state.gameData ]
  		});
  	}
  }

  // attach the app to the dom
  const render = ($element, parent) => {
  	parent.appendChild($element);
  };

  // Props for the app with default page(home)
  const props = {
  	page: Home,
  	slug: null
  };

  const app = new App(props); // Creates the app with the props

  render(app.base, document.body); // first time render (home is default state)

  routie({
  	'home': () => app.changePage({page: Home}),
  	'games/:slug': (slug) =>app.changePage({page: Games, slug}) 
  });

  // routie('home');

})));
//# sourceMappingURL=main.js.map
