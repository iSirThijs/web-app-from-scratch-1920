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
export function get(url, init) {
	return fetch(url, init)
		.then(checkStatus)
		.then(parseJSON);
}