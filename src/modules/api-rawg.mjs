import * as Fetcher from '../utilities/fetcher.mjs';

// This uses the URL Api : https://developer.mozilla.org/en-US/docs/Web/API/URL/URL
const baseURL = new URL('https://api.rawg.io/');

/**
 * Get a list of games/developers/creators/
 * @param {Stirng} [endpoint] - A stirng with the endpoint
 * @param {String[]} [params] - An array of string with search queries, without the results will be random
 * @returns {Promise<*>} - A resolved promise with the results of the query or an rejection with the error reason
 */
export function list(endpoint, params) {

	const gamesURL = new URL(`/api/${endpoint}`, baseURL);
	const searchParams = new URLSearchParams(params);

	if (params) gamesURL.search = searchParams;

	return Fetcher.get(gamesURL);

}