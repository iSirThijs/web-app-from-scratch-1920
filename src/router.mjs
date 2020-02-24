import 'utils/routie.js';
import App from './app.mjs'; 
import Home from './pages/home.mjs';
import Test from './pages/test.mjs'; // maybe move this to a seperate routes module;

const render = ($element, parent) => {
	parent.appendChild($element);
};

const app = new App();
render(app.base, document.body); // first time render (home is default state)

routie({
	'home': () => app.changePage(Home),
	'test': () => app.changePage(Test)
});

routie('home');
