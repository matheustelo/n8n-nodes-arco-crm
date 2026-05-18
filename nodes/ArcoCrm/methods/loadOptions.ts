import type {
	IDataObject,
	ILoadOptionsFunctions,
	INodePropertyOptions,
} from 'n8n-workflow';

type ListEnvelope<T> = { data: T[] };

async function fetchList<T>(
	context: ILoadOptionsFunctions,
	url: string,
	qs: IDataObject = {},
): Promise<T[]> {
	const response = (await context.helpers.httpRequestWithAuthentication.call(context, 'arcoCrmApi', {
		method: 'GET',
		url,
		qs: { limit: 100, ...qs },
		json: true,
	})) as ListEnvelope<T>;
	return response?.data ?? [];
}

type NamedRecord = { id: string; name: string };
type MembershipRecord = { id: string; full_name: string; email?: string };

const byName = ({ id, name }: NamedRecord): INodePropertyOptions => ({ name, value: id });

export async function loadPipelines(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	return (await fetchList<NamedRecord>(this, '/v1/lead-pipelines')).map(byName);
}

export async function loadActivityTypes(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	return (await fetchList<NamedRecord>(this, '/v1/activity-types')).map(byName);
}

export async function loadOrigins(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	return (await fetchList<NamedRecord>(this, '/v1/origins')).map(byName);
}

export async function loadTags(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	return (await fetchList<NamedRecord>(this, '/v1/tags')).map(byName);
}

export async function loadMemberships(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const items = await fetchList<MembershipRecord>(this, '/v1/memberships');
	return items.map((m) => ({
		name: m.email ? `${m.full_name} (${m.email})` : m.full_name,
		value: m.id,
	}));
}
