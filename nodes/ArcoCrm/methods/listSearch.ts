import type {
	IDataObject,
	ILoadOptionsFunctions,
	INodeListSearchItems,
	INodeListSearchResult,
} from 'n8n-workflow';

type ListEnvelope<T> = {
	data: T[];
	meta?: { next_cursor?: string | null; has_more?: boolean; limit?: number };
};

async function paginatedSearch<T>(
	context: ILoadOptionsFunctions,
	url: string,
	filter: string | undefined,
	paginationToken: string | undefined,
	toItem: (record: T) => INodeListSearchItems,
	supportsServerSearch = true,
): Promise<INodeListSearchResult> {
	const qs: IDataObject = { limit: 50 };
	if (paginationToken) qs.cursor = paginationToken;
	if (supportsServerSearch && filter) qs.search = filter;

	const response = (await context.helpers.httpRequestWithAuthentication.call(
		context,
		'arcoCrmApi',
		{ method: 'GET', url, qs, json: true },
	)) as ListEnvelope<T>;

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
type DealRecord = { id: string; name: string };
type ActivityRecord = { id: string; title: string };
type TagRecord = { id: string; name: string };
type PipelineRecord = { id: string; name: string };

export async function searchLeads(
	this: ILoadOptionsFunctions,
	filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	return paginatedSearch<LeadRecord>(this, '/leads', filter, paginationToken, (lead) => ({
		name: lead.email ? `${lead.name} (${lead.email})` : lead.name,
		value: lead.id,
	}));
}

export async function searchPeople(
	this: ILoadOptionsFunctions,
	filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	return paginatedSearch<PersonRecord>(this, '/people', filter, paginationToken, (person) => ({
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
		'/organizations',
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
	return paginatedSearch<DealRecord>(this, '/deals', filter, paginationToken, (deal) => ({
		name: deal.name,
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
		'/activities',
		filter,
		paginationToken,
		(activity) => ({ name: activity.title, value: activity.id }),
		false,
	);
}

export async function searchTags(
	this: ILoadOptionsFunctions,
	filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	return paginatedSearch<TagRecord>(
		this,
		'/tags',
		filter,
		paginationToken,
		(tag) => ({ name: tag.name, value: tag.id }),
		false,
	);
}

export async function searchPipelines(
	this: ILoadOptionsFunctions,
	filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	return paginatedSearch<PipelineRecord>(
		this,
		'/pipelines',
		filter,
		paginationToken,
		(pipeline) => ({ name: pipeline.name, value: pipeline.id }),
		false,
	);
}

export async function searchStages(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const pipelineParam = this.getCurrentNodeParameter('pipeline_id', { extractValue: true }) as
		| string
		| undefined;
	if (!pipelineParam) return { results: [] };

	const response = (await this.helpers.httpRequestWithAuthentication.call(this, 'arcoCrmApi', {
		method: 'GET',
		url: `/pipelines/${pipelineParam}/stages`,
		json: true,
	})) as ListEnvelope<{ id: string; name: string; position?: number }>;

	const records = Array.isArray(response?.data) ? response.data : [];
	const filtered = filter
		? records.filter((stage) => stage.name.toLowerCase().includes(filter.toLowerCase()))
		: records;

	return {
		results: filtered.map((stage) => ({ name: stage.name, value: stage.id })),
	};
}
