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

async function resolveBaseUrl(context: ILoadOptionsFunctions): Promise<string> {
	const creds = await context.getCredentials('arcoCrmApi');
	const raw = (creds?.baseUrl as string | undefined) ?? 'https://crm.grupoarco.cc/api';
	return raw.replace(/\/+$/, '');
}

async function fetchList<T>(
	context: ILoadOptionsFunctions,
	path: string,
	qs: IDataObject = {},
): Promise<T[]> {
	try {
		const baseUrl = await resolveBaseUrl(context);
		const response = (await context.helpers.httpRequestWithAuthentication.call(context, 'arcoCrmApi', {
			method: 'GET',
			url: `${baseUrl}${path}`,
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
type PipelineWithStages = NamedRecord & { stages?: NamedRecord[] };

const byName = ({ id, name }: NamedRecord): INodePropertyOptions => ({ name, value: id });

function readPipelineParam(context: ILoadOptionsFunctions, names: string[]): string | undefined {
	for (const name of names) {
		try {
			const value = context.getCurrentNodeParameter(name, { extractValue: true });
			if (typeof value === 'string' && value) return value;
		} catch {
			/* parameter not present on this form — try the next one */
		}
	}
	return undefined;
}

async function loadStages(
	context: ILoadOptionsFunctions,
	path: string,
	pipelineParamNames: string[],
): Promise<INodePropertyOptions[]> {
	const pipelineId = readPipelineParam(context, pipelineParamNames);
	if (!pipelineId) return [];
	const pipelines = await fetchList<PipelineWithStages>(context, path, { include_stages: true });
	const pipeline = pipelines.find((p) => p.id === pipelineId);
	return (pipeline?.stages ?? []).map(byName);
}

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

export async function loadLeadStages(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	return loadStages(this, '/v1/lead-pipelines', ['lead_pipeline_id', 'filters.lead_pipeline_id']);
}

export async function loadDealStages(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	return loadStages(this, '/v1/deal-pipelines', [
		'pipeline_id',
		'filters.pipeline_id',
		'deal_pipeline_id',
		'filters.deal_pipeline_id',
	]);
}
