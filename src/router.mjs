import 'utils/routie.js';
import App from './app.mjs'; 
import Home from './pages/home.mjs';
import Search from './pages/search.mjs';

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
