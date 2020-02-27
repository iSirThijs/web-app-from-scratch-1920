import 'utils/routie.js';
import App from './app.mjs'; 

// pages
import Home from './pages/home.mjs';
import Games from './pages/games.mjs';

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
