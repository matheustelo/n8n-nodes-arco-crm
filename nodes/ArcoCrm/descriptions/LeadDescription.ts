import type { INodeProperties } from 'n8n-workflow';
import { entityResourceLocator } from '../shared/resourceLocator';
import { limitProperty, returnAllProperty } from '../shared/pagination';
import { idempotencyKeyProperty } from '../shared/idempotency';
import { searchFilter } from '../shared/search';

const showFor = (operation: string[]): INodeProperties['displayOptions'] => ({
	show: { resource: ['lead'], operation },
});

const trafficTrackingField: INodeProperties = {
	displayName: 'Traffic Tracking',
	name: 'traffic_tracking',
	type: 'collection',
	placeholder: 'Add tracking field',
	default: {},
	description: 'UTMs, click IDs and referrer info for paid/organic traffic attribution',
	options: [
		{
			displayName: 'UTM Source',
			name: 'utm_source',
			type: 'string',
			default: '',
			routing: { send: { type: 'body', property: 'utm_source' } },
		},
		{
			displayName: 'UTM Medium',
			name: 'utm_medium',
			type: 'string',
			default: '',
			routing: { send: { type: 'body', property: 'utm_medium' } },
		},
		{
			displayName: 'UTM Campaign',
			name: 'utm_campaign',
			type: 'string',
			default: '',
			routing: { send: { type: 'body', property: 'utm_campaign' } },
		},
		{
			displayName: 'UTM Term',
			name: 'utm_term',
			type: 'string',
			default: '',
			routing: { send: { type: 'body', property: 'utm_term' } },
		},
		{
			displayName: 'UTM Content',
			name: 'utm_content',
			type: 'string',
			default: '',
			routing: { send: { type: 'body', property: 'utm_content' } },
		},
		{
			displayName: 'Google Click ID (Gclid)',
			name: 'gclid',
			type: 'string',
			default: '',
			routing: { send: { type: 'body', property: 'gclid' } },
		},
		{
			displayName: 'Facebook Click ID (Fbclid)',
			name: 'fbclid',
			type: 'string',
			default: '',
			routing: { send: { type: 'body', property: 'fbclid' } },
		},
		{
			displayName: 'Landing Page',
			name: 'landing_page',
			type: 'string',
			default: '',
			routing: { send: { type: 'body', property: 'landing_page' } },
		},
		{
			displayName: 'Referrer',
			name: 'referrer',
			type: 'string',
			default: '',
			routing: { send: { type: 'body', property: 'referrer' } },
		},
	],
};

export const leadDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['lead'] } },
		default: 'create',
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a lead',
				routing: { request: { method: 'POST', url: '/v1/leads' } },
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a lead',
				routing: {
					request: { method: 'GET', url: '=/v1/leads/{{ $parameter.lead_id.value || $parameter.lead_id }}' },
				},
			},
			{
				name: 'List',
				value: 'list',
				action: 'List leads',
				routing: { request: { method: 'GET', url: '/v1/leads' } },
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a lead',
				routing: {
					request: {
						method: 'PATCH',
						url: '=/v1/leads/{{ $parameter.lead_id.value || $parameter.lead_id }}',
					},
				},
			},
			{
				name: 'Change Stage',
				value: 'changeStage',
				action: 'Change a leads stage',
				routing: {
					request: {
						method: 'PATCH',
						url: '=/v1/leads/{{ $parameter.lead_id.value || $parameter.lead_id }}/stage',
					},
				},
			},
			{
				name: 'Disqualify',
				value: 'disqualify',
				action: 'Disqualify a lead',
				routing: {
					request: {
						method: 'POST',
						url: '=/v1/leads/{{ $parameter.lead_id.value || $parameter.lead_id }}/disqualify',					},
				},
			},
			{
				name: 'Reopen',
				value: 'reopen',
				action: 'Reopen a disqualified lead',
				routing: {
					request: {
						method: 'POST',
						url: '=/v1/leads/{{ $parameter.lead_id.value || $parameter.lead_id }}/reopen',					},
				},
			},
			{
				name: 'Convert',
				value: 'convert',
				action: 'Convert a lead',
				routing: {
					request: {
						method: 'POST',
						url: '=/v1/leads/{{ $parameter.lead_id.value || $parameter.lead_id }}/convert',
					},
				},
			},
			{
				name: 'Convert Preview',
				value: 'convertPreview',
				action: 'Preview lead conversion',
				routing: {
					request: {
						method: 'GET',
						url: '=/v1/leads/{{ $parameter.lead_id.value || $parameter.lead_id }}/convert/preview',
					},
				},
			},
			{
				name: 'Claim',
				value: 'claim',
				action: 'Claim a lead',
				routing: {
					request: {
						method: 'POST',
						url: '=/v1/leads/{{ $parameter.lead_id.value || $parameter.lead_id }}/claim',					},
				},
			},
			{
				name: 'Get Stage History',
				value: 'stageHistory',
				action: 'Get a leads stage history',
				routing: {
					request: {
						method: 'GET',
						url: '=/v1/leads/{{ $parameter.lead_id.value || $parameter.lead_id }}/stage-history',
					},
				},
			},
			{
				name: 'List Tags',
				value: 'listTags',
				action: 'List a leads tags',
				routing: {
					request: {
						method: 'GET',
						url: '=/v1/leads/{{ $parameter.lead_id.value || $parameter.lead_id }}/tags',
					},
				},
			},
			{
				name: 'Add Tags',
				value: 'addTags',
				action: 'Add tags to a lead',
				routing: {
					request: {
						method: 'POST',
						url: '=/v1/leads/{{ $parameter.lead_id.value || $parameter.lead_id }}/tags',
					},
				},
			},
			{
				name: 'Remove Tags',
				value: 'removeTags',
				action: 'Remove tags from a lead',
				routing: {
					request: {
						method: 'DELETE',
						url: '=/v1/leads/{{ $parameter.lead_id.value || $parameter.lead_id }}/tags',
					},
				},
			},
		],
	},

	// ── Lead ID (used by all operations except create/list) ────────────────────
	entityResourceLocator({
		displayName: 'Lead',
		name: 'lead_id',
		required: true,
		searchListMethod: 'searchLeads',
		urlPathSegment: 'leads',
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: [
					'get',
					'update',
					'changeStage',
					'disqualify',
					'reopen',
					'convert',
					'convertPreview',
					'claim',
					'stageHistory',
					'listTags',
					'addTags',
					'removeTags',
				],
			},
		},
	}),

	// ── Create ────────────────────────────────────────────────────────────────
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
		displayOptions: showFor(['create']),
		routing: { send: { type: 'body', property: 'name' } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add field',
		default: {},
		displayOptions: showFor(['create']),
		options: [
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				placeholder: 'name@example.com',
				routing: { send: { type: 'body', property: 'email' } },
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
				routing: { send: { type: 'body', property: 'phone' } },
			},
			{
				displayName: 'Company',
				name: 'company',
				type: 'string',
				default: '',
				routing: { send: { type: 'body', property: 'company' } },
			},
			{
				displayName: 'Origin Name or ID',
				name: 'origin_id',
				type: 'options',
				typeOptions: { loadOptionsMethod: 'loadOrigins' },
				default: '',
				description:
					'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				routing: { send: { type: 'body', property: 'origin_id' } },
			},
			{
				displayName: 'Owner Membership Name or ID',
				name: 'owner_membership_id',
				type: 'options',
				typeOptions: { loadOptionsMethod: 'loadMemberships' },
				default: '',
				description:
					'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				routing: { send: { type: 'body', property: 'owner_membership_id' } },
			},
			trafficTrackingField,
			{
				displayName: 'Custom Data (JSON)',
				name: 'custom_data',
				type: 'json',
				default: '{}',
				routing: {
					send: {
						type: 'body',
						property: 'custom_data',
						value: '={{ typeof $value === "string" ? JSON.parse($value || "{}") : $value }}',
					},
				},
			},
			{
				...entityResourceLocator({
					displayName: 'Campaign',
					name: 'campaign_id',
					searchListMethod: 'searchCampaigns',
					urlPathSegment: 'campaigns',
					description:
						'Enrolls the new lead as a participant in this campaign’s first stage. Requires the campaigns:operate:all scope. Atomic: if the enrollment fails, the lead is not created.',
				}),
				routing: {
					send: { type: 'body', property: 'campaign_id', value: '={{ $value.value || $value }}' },
				},
			},
		],
	},

	idempotencyKeyProperty('lead'),

	// ── List ──────────────────────────────────────────────────────────────────
	returnAllProperty({ resource: ['lead'], operation: ['list'] }),
	limitProperty({ resource: ['lead'], operation: ['list'] }),
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add filter',
		default: {},
		displayOptions: showFor(['list']),
		options: [
			searchFilter('name, email or phone'),
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				default: 'open',
				options: [
					{ name: 'Open', value: 'open' },
					{ name: 'Qualified', value: 'qualified' },
					{ name: 'Disqualified', value: 'disqualified' },
				],
				routing: { send: { type: 'query', property: 'status' } },
			},
			{
				...entityResourceLocator({
					displayName: 'Lead Pipeline',
					name: 'lead_pipeline_id',
					searchListMethod: 'searchLeadPipelines',
					urlPathSegment: 'lead-pipelines',
				}),
				routing: {
					send: { type: 'query', property: 'lead_pipeline_id', value: '={{ $value.value || $value }}' },
				},
			},
			{
				...entityResourceLocator({
					displayName: 'Lead Stage',
					name: 'lead_stage_id',
					searchListMethod: 'searchLeadStages',
					urlPathSegment: 'lead-stages',
					description: 'Pick the pipeline first to load its stages',
				}),
				routing: {
					send: { type: 'query', property: 'lead_stage_id', value: '={{ $value.value || $value }}' },
				},
			},
			{
				displayName: 'Origin Name or ID',
				name: 'origin_id',
				type: 'options',
				typeOptions: { loadOptionsMethod: 'loadOrigins' },
				default: '',
				description:
					'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				routing: { send: { type: 'query', property: 'origin_id' } },
			},
			{
				displayName: 'Owner Membership Name or ID',
				name: 'owner_membership_id',
				type: 'options',
				typeOptions: { loadOptionsMethod: 'loadMemberships' },
				default: '',
				description:
					'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				routing: { send: { type: 'query', property: 'owner_membership_id' } },
			},
			{
				displayName: 'Unassigned',
				name: 'unassigned',
				type: 'boolean',
				default: false,
				routing: { send: { type: 'query', property: 'unassigned' } },
			},
			{
				displayName: 'Converted',
				name: 'converted',
				type: 'boolean',
				default: false,
				routing: { send: { type: 'query', property: 'converted' } },
			},
		],
	},

	// ── Update ────────────────────────────────────────────────────────────────
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add field',
		default: {},
		displayOptions: showFor(['update']),
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				routing: { send: { type: 'body', property: 'name' } },
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				placeholder: 'name@email.com',
				default: '',
				routing: { send: { type: 'body', property: 'email' } },
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
				routing: { send: { type: 'body', property: 'phone' } },
			},
			{
				displayName: 'Company',
				name: 'company',
				type: 'string',
				default: '',
				routing: { send: { type: 'body', property: 'company' } },
			},
			{
				displayName: 'Owner Membership Name or ID',
				name: 'owner_membership_id',
				type: 'options',
				typeOptions: { loadOptionsMethod: 'loadMemberships' },
				default: '',
				description:
					'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				routing: { send: { type: 'body', property: 'owner_membership_id' } },
			},
			trafficTrackingField,
			{
				displayName: 'Custom Data (JSON)',
				name: 'custom_data',
				type: 'json',
				default: '{}',
				routing: {
					send: {
						type: 'body',
						property: 'custom_data',
						value: '={{ typeof $value === "string" ? JSON.parse($value || "{}") : $value }}',
					},
				},
			},
		],
	},

	// ── Change Stage ──────────────────────────────────────────────────────────
	{
		...entityResourceLocator({
			displayName: 'Lead Stage',
			name: 'lead_stage_id',
			required: true,
			searchListMethod: 'searchLeadStages',
			urlPathSegment: 'lead-stages',
			description: 'Pick the lead pipeline first (see "Lead Pipeline" below) to load its stages',
			displayOptions: showFor(['changeStage']),
		}),
		routing: {
			send: { type: 'body', property: 'lead_stage_id', value: '={{ $value.value || $value }}' },
		},
	},
	{
		...entityResourceLocator({
			displayName: 'Lead Pipeline',
			name: 'lead_pipeline_id',
			required: false,
			searchListMethod: 'searchLeadPipelines',
			urlPathSegment: 'lead-pipelines',
			description:
				'Populates the Stage dropdown. Pick a different pipeline to move the lead to another funnel (lead must be open); keep the current one to only change stage. Leave empty to change stage within the current pipeline.',
			displayOptions: showFor(['changeStage']),
		}),
		routing: {
			send: {
				type: 'body',
				property: 'lead_pipeline_id',
				value: '={{ (typeof $value === "object" ? $value.value : $value) || undefined }}',
			},
		},
	},

	// ── Disqualify ────────────────────────────────────────────────────────────
	{
		displayName: 'Disqualify Options',
		name: 'disqualifyOptions',
		type: 'collection',
		placeholder: 'Add field',
		default: {},
		displayOptions: showFor(['disqualify']),
		options: [
			{
				...entityResourceLocator({
					displayName: 'Disqualification Reason',
					name: 'disqualification_reason_id',
					searchListMethod: 'searchLeadLossReasons',
					urlPathSegment: 'loss-reasons',
				}),
				routing: {
					send: {
						type: 'body',
						property: 'disqualification_reason_id',
						value: '={{ $value.value || $value }}',
					},
				},
			},
			{
				displayName: 'Comment',
				name: 'disqualification_comment',
				type: 'string',
				default: '',
				routing: { send: { type: 'body', property: 'disqualification_comment' } },
			},
		],
	},

	// ── Convert ───────────────────────────────────────────────────────────────
	{
		displayName: 'Person Action',
		name: 'person_action',
		type: 'options',
		default: 'create',
		required: true,
		displayOptions: showFor(['convert']),
		options: [
			{ name: 'Create', value: 'create' },
			{ name: 'Link Existing', value: 'link' },
			{ name: 'Skip', value: 'skip' },
		],
		routing: { send: { type: 'body', property: 'person_action' } },
	},
	{
		displayName: 'Person ID',
		name: 'person_id',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { resource: ['lead'], operation: ['convert'], person_action: ['link'] } },
		routing: { send: { type: 'body', property: 'person_id' } },
	},
	{
		displayName: 'Organization Action',
		name: 'organization_action',
		type: 'options',
		default: 'skip',
		displayOptions: showFor(['convert']),
		options: [
			{ name: 'Create', value: 'create' },
			{ name: 'Link Existing', value: 'link' },
			{ name: 'Skip', value: 'skip' },
		],
		routing: { send: { type: 'body', property: 'organization_action' } },
	},
	{
		displayName: 'Organization ID',
		name: 'organization_id',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: { resource: ['lead'], operation: ['convert'], organization_action: ['link'] },
		},
		routing: { send: { type: 'body', property: 'organization_id' } },
	},
	{
		displayName: 'Deal Action',
		name: 'deal_action',
		type: 'options',
		default: 'skip',
		displayOptions: showFor(['convert']),
		options: [
			{ name: 'Create', value: 'create' },
			{ name: 'Skip', value: 'skip' },
		],
		routing: { send: { type: 'body', property: 'deal_action' } },
	},
	{
		...entityResourceLocator({
			displayName: 'Deal Pipeline',
			name: 'deal_pipeline_id',
			required: true,
			searchListMethod: 'searchDealPipelines',
			urlPathSegment: 'deal-pipelines',
			displayOptions: { show: { resource: ['lead'], operation: ['convert'], deal_action: ['create'] } },
		}),
		routing: {
			send: { type: 'body', property: 'deal_pipeline_id', value: '={{ $value.value || $value }}' },
		},
	},
	{
		...entityResourceLocator({
			displayName: 'Deal Stage',
			name: 'deal_stage_id',
			required: true,
			searchListMethod: 'searchDealStages',
			urlPathSegment: 'deal-stages',
			description: 'Pick the deal pipeline first to load its stages',
			displayOptions: { show: { resource: ['lead'], operation: ['convert'], deal_action: ['create'] } },
		}),
		routing: {
			send: { type: 'body', property: 'deal_stage_id', value: '={{ $value.value || $value }}' },
		},
	},
	{
		displayName: 'Deal Options',
		name: 'dealOptions',
		type: 'collection',
		placeholder: 'Add field',
		default: {},
		displayOptions: { show: { resource: ['lead'], operation: ['convert'], deal_action: ['create'] } },
		options: [
			{
				displayName: 'Deal Value',
				name: 'deal_value',
				type: 'number',
				default: 0,
				routing: { send: { type: 'body', property: 'deal_value' } },
			},
			{
				displayName: 'Currency',
				name: 'deal_currency',
				type: 'string',
				default: 'BRL',
				routing: { send: { type: 'body', property: 'deal_currency' } },
			},
			{
				displayName: 'Expected Close Date',
				name: 'deal_expected_close_date',
				type: 'dateTime',
				default: '',
				routing: { send: { type: 'body', property: 'deal_expected_close_date' } },
			},
		],
	},

	// ── Add / Remove Tags ─────────────────────────────────────────────────────
	{
		displayName: 'Tag Names or IDs',
		name: 'tag_ids',
		type: 'multiOptions',
		typeOptions: { loadOptionsMethod: 'loadTags' },
		default: [],
		required: true,
		displayOptions: showFor(['addTags', 'removeTags']),
		description:
			'Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		routing: { send: { type: 'body', property: 'tag_ids' } },
	},
];
