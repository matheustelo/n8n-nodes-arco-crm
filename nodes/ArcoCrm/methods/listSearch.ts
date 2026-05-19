import { NodeApiError } from 'n8n-workflow';
import type {
	IDataObject,
	ILoadOptionsFunctions,
	INodeListSearchItems,
	INodeListSearchResult,
	JsonObject,
} from 'n8n-workflow';

type ListEnvelope<T> = {
	data: T[];
	meta?: { next_cursor?: string | null; has_more?: boolean; limit?: number };
};

function isScopeDenied(error: unknown): boolean {
	const err = error as { httpCode?: string | number; cause?: { error?: { code?: string } } } | undefined;
	if (!err) return false;
	if (String(err.httpCode) === '403') return true;
	return err.cause?.error?.code === 'SCOPE_DENIED';
}

async function paginatedSearch<T>(
	context: ILoadOptionsFunctions,
	url: string,
	filter: string | undefined,
	paginationToken: string | undefined,
	toItem: (record: T) => INodeListSearchItems,
	supportsServerSearch = false,
): Promise<INodeListSearchResult> {
	const qs: IDataObject = { limit: 50 };
	if (paginationToken) qs.cursor = paginationToken;
	if (supportsServerSearch && filter) qs.search = filter;

	let response: ListEnvelope<T>;
	try {
		response = (await context.helpers.httpRequestWithAuthentication.call(
			context,
			'arcoCrmApi',
			{ method: 'GET', url, qs, json: true },
		)) as ListEnvelope<T>;
	} catch (error) {
		if (isScopeDenied(error)) return { results: [] };
		throw new NodeApiError(context.getNode(), error as JsonObject);
	}

	const records = Array.isArray(response?.data) ? response.data : [];
	const filtered =
		!supportsServerSearch && filter
			? records.filter((record) => {
					const item = toItem(record);
					return item.name.toLowerCase().includes(filter.toLowerCase());
				})
			: records;

	return {
		results: filtered.map(toItem),
		paginationToken: response?.meta?.next_cursor ?? undefined,
	};
}

type LeadRecord = { id: string; name: string; email?: string };
type PersonRecord = { id: string; name: string; email?: string };
type OrganizationRecord = { id: string; name: string };
type DealRecord = { id: string; title: string };
type ActivityRecord = { id: string; title: string };
type TagRecord = { id: string; name: string };
type PipelineRecord = { id: string; name: string; stages?: Array<{ id: string; name: string }> };
type OriginRecord = { id: string; name: string };
type MembershipRecord = { id: string; full_name: string; email?: string };
type LossReasonRecord = { id: string; name: string };

export async function searchLeads(
	this: ILoadOptionsFunctions,
	filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	return paginatedSearch<LeadRecord>(this, '/v1/leads', filter, paginationToken, (lead) => ({
		name: lead.email ? `${lead.name} (${lead.email})` : lead.name,
		value: lead.id,
	}));
}

export async function searchPeople(
	this: ILoadOptionsFunctions,
	filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	return paginatedSearch<PersonRecord>(this, '/v1/people', filter, paginationToken, (person) => ({
		name: person.email ? `${person.name} (${person.email})` : person.name,
		value: person.id,
	}));
}

export async function searchOrganizations(
	this: ILoadOptionsFunctions,
	filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	return paginatedSearch<OrganizationRecord>(
		this,
		'/v1/organizations',
		filter,
		paginationToken,
		(org) => ({ name: org.name, value: org.id }),
	);
}

export async function searchDeals(
	this: ILoadOptionsFunctions,
	filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	return paginatedSearch<DealRecord>(this, '/v1/deals', filter, paginationToken, (deal) => ({
		name: deal.title,
		value: deal.id,
	}));
}

export async function searchActivities(
	this: ILoadOptionsFunctions,
	filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	return paginatedSearch<ActivityRecord>(
		this,
		'/v1/activities',
		filter,
		paginationToken,
		(activity) => ({ name: activity.title, value: activity.id }),
	);
}

export async function searchTags(
	this: ILoadOptionsFunctions,
	filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	return paginatedSearch<TagRecord>(
		this,
		'/v1/tags',
		filter,
		paginationToken,
		(tag) => ({ name: tag.name, value: tag.id }),
	);
}

export async function searchLeadPipelines(
	this: ILoadOptionsFunctions,
	filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	return paginatedSearch<PipelineRecord>(
		this,
		'/v1/lead-pipelines',
		filter,
		paginationToken,
		(pipeline) => ({ name: pipeline.name, value: pipeline.id }),
	);
}

export async function searchDealPipelines(
	this: ILoadOptionsFunctions,
	filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	return paginatedSearch<PipelineRecord>(
		this,
		'/v1/deal-pipelines',
		filter,
		paginationToken,
		(pipeline) => ({ name: pipeline.name, value: pipeline.id }),
	);
}

export async function searchOrigins(
	this: ILoadOptionsFunctions,
	filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	return paginatedSearch<OriginRecord>(
		this,
		'/v1/origins',
		filter,
		paginationToken,
		(origin) => ({ name: origin.name, value: origin.id }),
	);
}

export async function searchMemberships(
	this: ILoadOptionsFunctions,
	filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	return paginatedSearch<MembershipRecord>(
		this,
		'/v1/memberships',
		filter,
		paginationToken,
		(member) => ({
			name: member.email ? `${member.full_name} (${member.email})` : member.full_name,
			value: member.id,
		}),
	);
}

export async function searchLossReasons(
	this: ILoadOptionsFunctions,
	filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	return paginatedSearch<LossReasonRecord>(
		this,
		'/v1/loss-reasons',
		filter,
		paginationToken,
		(reason) => ({ name: reason.name, value: reason.id }),
	);
}

async function fetchPipelineStages(
	context: ILoadOptionsFunctions,
	url: string,
	pipelineId: string,
): Promise<Array<{ id: string; name: string }>> {
	try {
		const response = (await context.helpers.httpRequestWithAuthentication.call(context, 'arcoCrmApi', {
			method: 'GET',
			url,
			qs: { include_stages: true, limit: 100 },
			json: true,
		})) as ListEnvelope<PipelineRecord>;
		const pipeline = (response?.data ?? []).find((p) => p.id === pipelineId);
		return pipeline?.stages ?? [];
	} catch (error) {
		if (isScopeDenied(error)) return [];
		throw new NodeApiError(context.getNode(), error as JsonObject);
	}
}

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

export async function searchLeadStages(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const pipelineId = readPipelineParam(this, ['lead_pipeline_id']);
	if (!pipelineId) return { results: [] };
	const stages = await fetchPipelineStages(this, '/v1/lead-pipelines', pipelineId);
	const filtered = filter
		? stages.filter((stage) => stage.name.toLowerCase().includes(filter.toLowerCase()))
		: stages;
	return { results: filtered.map((stage) => ({ name: stage.name, value: stage.id })) };
}

export async function searchDealStages(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const pipelineId = readPipelineParam(this, ['pipeline_id', 'deal_pipeline_id']);
	if (!pipelineId) return { results: [] };
	const stages = await fetchPipelineStages(this, '/v1/deal-pipelines', pipelineId);
	const filtered = filter
		? stages.filter((stage) => stage.name.toLowerCase().includes(filter.toLowerCase()))
		: stages;
	return { results: filtered.map((stage) => ({ name: stage.name, value: stage.id })) };
}
