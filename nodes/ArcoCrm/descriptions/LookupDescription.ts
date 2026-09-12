import { NodeOperationError } from 'n8n-workflow';
import type {
	IDataObject,
	IExecuteSingleFunctions,
	IHttpRequestOptions,
	IN8nHttpFullResponse,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';

/**
 * Lookup — `GET /v1/lookup`.
 *
 * Exact-key search across leads, people and organizations by phone, e-mail,
 * CPF or CNPJ. The API normalizes each key (masks stripped, CPF/CNPJ check
 * digits validated, Brazilian phones match with and without the ninth digit),
 * combines the keys with OR and tells, per row, which keys matched
 * (`matched_by`). Results come grouped by type with no cursor; `limit` applies
 * per type. Each requested type needs its own `{type}:read:all` scope.
 */

const LOOKUP_KEYS = ['phone', 'email', 'cpf', 'cnpj'] as const;

const LOOKUP_TYPES = ['leads', 'people', 'organizations'] as const;
type LookupType = (typeof LOOKUP_TYPES)[number];

type LookupRow = IDataObject & { id: string; matched_by?: string[] };
type LookupResponseBody = {
	data?: Partial<Record<LookupType, LookupRow[]>>;
	meta?: { limit?: number; types?: LookupType[] };
};

/**
 * preSend: builds the query string from the four optional key fields, sending
 * only the ones the user filled. Empty query params would otherwise reach the
 * API as `phone=` and be rejected. Also enforces the API's "at least one key"
 * rule up-front so the user sees a clear node error instead of a raw 400.
 */
const buildLookupQuery = async function (
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const qs: IDataObject = { ...((requestOptions.qs as IDataObject | undefined) ?? {}) };

	for (const key of LOOKUP_KEYS) {
		const value = String(this.getNodeParameter(key, '') ?? '').trim();
		if (value) qs[key] = value;
		else delete qs[key];
	}

	const hasKey = LOOKUP_KEYS.some((key) => qs[key] !== undefined);
	if (!hasKey) {
		throw new NodeOperationError(
			this.getNode(),
			'Fill at least one lookup key: Phone, Email, CPF or CNPJ.',
			{ itemIndex: this.getItemIndex() },
		);
	}

	const types = (this.getNodeParameter('types', []) as LookupType[]).filter((type) =>
		LOOKUP_TYPES.includes(type),
	);
	if (types.length > 0) qs.types = types.join(',');
	else delete qs.types;

	requestOptions.qs = qs;
	return requestOptions;
};

/**
 * postReceive: when "Split Into Items" is on, flattens the grouped response into
 * one item per matched row, tagging each with its `type` so downstream nodes
 * can tell a lead from a person from an organization. Falls back to the raw
 * envelope otherwise (the same shape every other operation returns).
 */
const splitLookupItems = async function (
	this: IExecuteSingleFunctions,
	items: INodeExecutionData[],
	response: IN8nHttpFullResponse,
): Promise<INodeExecutionData[]> {
	const split = this.getNodeParameter('splitIntoItems', false) as boolean;
	if (!split) return items;

	const body = response.body as LookupResponseBody;
	const data = body?.data ?? {};
	const rows: INodeExecutionData[] = [];

	for (const type of LOOKUP_TYPES) {
		for (const row of data[type] ?? []) {
			rows.push({ json: { type, ...row } });
		}
	}

	return rows;
};

const showFor = (operation: string[]): INodeProperties['displayOptions'] => ({
	show: { resource: ['lookup'], operation },
});

export const lookupDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['lookup'] } },
		default: 'find',
		options: [
			{
				name: 'Find',
				value: 'find',
				action: 'Find records by key',
				description:
					'Exact match by phone, e-mail, CPF or CNPJ across leads, people and organizations',
				routing: {
					request: { method: 'GET', url: '/v1/lookup' },
					send: { preSend: [buildLookupQuery] },
					output: { postReceive: [splitLookupItems] },
				},
			},
		],
	},

	// ── Keys (at least one required — enforced in preSend) ────────────────────
	{
		displayName: 'Phone',
		name: 'phone',
		type: 'string',
		default: '',
		placeholder: 'e.g. +5551991421718 or 51991421718',
		description:
			'E.164 with or without "+", or national with area code. Brazilian numbers match records saved with and without the ninth digit.',
		displayOptions: showFor(['find']),
	},
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		default: '',
		placeholder: 'name@example.com',
		description: 'Exact match after normalization (case-insensitive)',
		displayOptions: showFor(['find']),
	},
	{
		displayName: 'CPF',
		name: 'cpf',
		type: 'string',
		default: '',
		placeholder: 'e.g. 123.456.789-09 or 12345678909',
		description:
			'With or without mask. Check digits are validated by the API (400 INVALID_CPF). Matches people only.',
		displayOptions: showFor(['find']),
	},
	{
		displayName: 'CNPJ',
		name: 'cnpj',
		type: 'string',
		default: '',
		placeholder: 'e.g. 12.345.678/0001-95 or 12345678000195',
		description:
			'With or without mask. Check digits are validated by the API (400 INVALID_CNPJ). Matches organizations only.',
		displayOptions: showFor(['find']),
	},
	{
		displayName: 'At least one key is required. Keys are combined with OR; each result lists which keys matched in <code>matched_by</code>.',
		name: 'keysNotice',
		type: 'notice',
		default: '',
		displayOptions: showFor(['find']),
	},

	// ── Scope / shape ─────────────────────────────────────────────────────────
	{
		displayName: 'Types',
		name: 'types',
		type: 'multiOptions',
		default: ['leads', 'people', 'organizations'],
		description:
			'Which entity types to search. Each type requires its own {type}:read:all scope on the API key.',
		displayOptions: showFor(['find']),
		options: [
			{ name: 'Leads', value: 'leads' },
			{ name: 'People', value: 'people' },
			{ name: 'Organizations', value: 'organizations' },
		],
	},
	{
		displayName: 'Limit Per Type',
		name: 'limitPerType',
		type: 'number',
		default: 10,
		typeOptions: { minValue: 1, maxValue: 50 },
		description:
			'Max number of results to return for each type (API default 10, max 50). This endpoint has no cursor pagination.',
		displayOptions: showFor(['find']),
		routing: { send: { type: 'query', property: 'limit' } },
	},
	{
		displayName: 'Split Into Items',
		name: 'splitIntoItems',
		type: 'boolean',
		default: false,
		description:
			'Whether to output one item per matched record (with a <code>type</code> field) instead of the raw grouped response',
		displayOptions: showFor(['find']),
	},
];
