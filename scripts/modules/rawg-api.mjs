import * as Fetcher from './fetch-utilities.mjs';

const baseURL = new URL('https://api.rawg.io/');

/**
 * Get a list of games
 * @param {String[]} [params] - An array of string with search queries, without the results will be random
 * @returns {Promise<*>} - A resolved promise with the results of the query or an rejection with the error reason
 */
export function gameList(params) {

	const gamesURL = new URL('/api/games', baseURL);
	const searchParams = new URLSearchParams(params);

	if (params) gamesURL.search = searchParams;

	Fetcher.get(gamesURL)
		.then(res => console.log(res))
		.catch(error => console.error(error));

}