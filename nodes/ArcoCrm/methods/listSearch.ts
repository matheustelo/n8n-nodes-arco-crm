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
type DealRecord = { id: string; title: string };
type ActivityRecord = { id: string; title: string };
type TagRecord = { id: string; name: string };
type PipelineRecord = { id: string; name: string; stages?: Array<{ id: string; name: string }> };
type OriginRecord = { id: string; name: string };
type MembershipRecord = { id: string; full_name: string; email?: string };

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
		'/v1/tags',
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
		'/v1/lead-pipelines',
		filter,
		paginationToken,
		(pipeline) => ({ name: pipeline.name, value: pipeline.id }),
		false,
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
		false,
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
		url: '/v1/lead-pipelines',
		qs: { include_stages: true, limit: 100 },
		json: true,
	})) as ListEnvelope<PipelineRecord>;

	const pipeline = (response?.data ?? []).find((p) => p.id === pipelineParam);
	const stages = pipeline?.stages ?? [];
	const filtered = filter
		? stages.filter((stage) => stage.name.toLowerCase().includes(filter.toLowerCase()))
		: stages;

	return {
		results: filtered.map((stage) => ({ name: stage.name, value: stage.id })),
	};
}
