import { NodeApiError } from 'n8n-workflow';
import type {
	FieldType,
	IDataObject,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	JsonObject,
	ResourceMapperField,
	ResourceMapperFields,
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

type CustomFieldRecord = {
	id: string;
	entity_type: string;
	key: string;
	label: string;
	type: 'text' | 'number' | 'currency' | 'date' | 'datetime' | 'checkbox' | 'select' | 'radio' | 'multiselect' | 'user' | 'file';
	config?: { options?: Array<string | { label?: string; value?: string }> };
	is_required?: boolean;
};

type MembershipRecord = { id: string; full_name: string; email?: string };

const TYPE_MAP: Record<CustomFieldRecord['type'], FieldType> = {
	text: 'string',
	number: 'number',
	currency: 'number',
	date: 'dateTime',
	datetime: 'dateTime',
	checkbox: 'boolean',
	select: 'options',
	radio: 'options',
	// resourceMapper has no dedicated multi-select FieldType — rendered as a
	// single-select dropdown; picking one value is still a valid custom_data write.
	multiselect: 'options',
	user: 'options',
	file: 'string',
};

function toSelectOptions(
	config: CustomFieldRecord['config'],
): INodePropertyOptions[] | undefined {
	if (!config?.options?.length) return undefined;
	return config.options.map((opt) => {
		if (typeof opt === 'string') return { name: opt, value: opt };
		const value = opt.value ?? opt.label ?? '';
		return { name: opt.label ?? value, value };
	});
}

async function buildCustomFieldColumns(
	context: ILoadOptionsFunctions,
	entityType: 'lead' | 'person' | 'organization' | 'deal',
): Promise<ResourceMapperFields> {
	const customFields = await fetchList<CustomFieldRecord>(context, '/v1/custom-fields', {
		entity_type: entityType,
	});

	let membershipOptions: INodePropertyOptions[] | undefined;
	if (customFields.some((f) => f.type === 'user')) {
		const memberships = await fetchList<MembershipRecord>(context, '/v1/memberships');
		membershipOptions = memberships.map((m) => ({
			name: m.email ? `${m.full_name} (${m.email})` : m.full_name,
			value: m.id,
		}));
	}

	const fields: ResourceMapperField[] = customFields.map((field) => ({
		id: field.key,
		displayName: field.label,
		type: TYPE_MAP[field.type],
		required: field.is_required ?? false,
		display: true,
		defaultMatch: false,
		options: field.type === 'user' ? membershipOptions : toSelectOptions(field.config),
	}));

	return { fields };
}

export async function getLeadCustomFieldColumns(this: ILoadOptionsFunctions): Promise<ResourceMapperFields> {
	return buildCustomFieldColumns(this, 'lead');
}

export async function getPersonCustomFieldColumns(this: ILoadOptionsFunctions): Promise<ResourceMapperFields> {
	return buildCustomFieldColumns(this, 'person');
}

export async function getOrganizationCustomFieldColumns(
	this: ILoadOptionsFunctions,
): Promise<ResourceMapperFields> {
	return buildCustomFieldColumns(this, 'organization');
}

export async function getDealCustomFieldColumns(this: ILoadOptionsFunctions): Promise<ResourceMapperFields> {
	return buildCustomFieldColumns(this, 'deal');
}
