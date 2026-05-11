import type {
	IDataObject,
	ILoadOptionsFunctions,
	INodePropertyOptions,
} from 'n8n-workflow';

type ListEnvelope<T> = { data: T[] };

async function fetchAll<T extends { id: string; name: string }>(
	this: ILoadOptionsFunctions,
	url: string,
	qs: IDataObject = {},
): Promise<INodePropertyOptions[]> {
	const response = (await this.helpers.httpRequestWithAuthentication.call(this, 'arcoCrmApi', {
		method: 'GET',
		url,
		qs: { limit: 100, ...qs },
		json: true,
	})) as ListEnvelope<T>;

	return (response?.data ?? []).map((item) => ({ name: item.name, value: item.id }));
}

export async function loadPipelines(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	return fetchAll.call(this, '/pipelines');
}

export async function loadActivityTypes(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	return fetchAll.call(this, '/activity-types');
}

export async function loadOrigins(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	return fetchAll.call(this, '/origins');
}

export async function loadTags(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	return fetchAll.call(this, '/tags');
}
