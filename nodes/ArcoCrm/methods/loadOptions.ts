import { NodeApiError } from 'n8n-workflow';
import type {
	IDataObject,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	JsonObject,
} from 'n8n-workflow';

type ListEnvelope<T> = { data: T[] };

function isScopeDenied(error: unknown): boolean {
	const err = error as { httpCode?: string | number; cause?: { error?: { code?: string } } } | undefined;
	if (!err) return false;
	if (String(err.httpCode) === '403') return true;
	return err.cause?.error?.code === 'SCOPE_DENIED';
}

async function fetchList<T>(
	context: ILoadOptionsFunctions,
	url: string,
	qs: IDataObject = {},
): Promise<T[]> {
	try {
		const response = (await context.helpers.httpRequestWithAuthentication.call(context, 'arcoCrmApi', {
			method: 'GET',
			url,
			qs: { limit: 100, ...qs },
			json: true,
		})) as ListEnvelope<T>;
		return response?.data ?? [];
	} catch (error) {
		if (isScopeDenied(error)) return [];
		throw new NodeApiError(context.getNode(), error as JsonObject);
	}
}

type NamedRecord = { id: string; name: string };
type MembershipRecord = { id: string; full_name: string; email?: string };

const byName = ({ id, name }: NamedRecord): INodePropertyOptions => ({ name, value: id });

export async function loadLeadPipelines(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	return (await fetchList<NamedRecord>(this, '/v1/lead-pipelines')).map(byName);
}

export async function loadDealPipelines(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	return (await fetchList<NamedRecord>(this, '/v1/deal-pipelines')).map(byName);
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
