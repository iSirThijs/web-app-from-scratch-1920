export function transformToResultList(data) {
	return data.results.map((result) => {
		let { id, slug, name } = result;
		return { id, slug, name };
	});
}