import 'utils/routie.js';
import App from './app.mjs'; 
import Home from './pages/home.mjs';
import Search from './pages/search.mjs';

const app = new App();
const render = ($element, parent) => {
	parent.appendChild($element);
};

render(app.base, document.body); // first time render (home is default state)

routie({
	'home': () => app.changePage(Home),
	'search': () => app.changePage(Search)
});

routie('home');
