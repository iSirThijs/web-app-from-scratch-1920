import 'utils/routie.js';
import App from './app.mjs'; 
import Home from './pages/home.mjs';

// attach the app to the dom
const render = ($element, parent) => {
	parent.appendChild($element);
};

// Props for the app with default page(home)
const props = {
	hash: 'Home',
	page: Home
};

const app = new App(props); // Creates the app with the props

render(app.base, document.body); // first time render (home is default state)

routie({
	'home': () => app.changePage(['Home', Home]),
});

