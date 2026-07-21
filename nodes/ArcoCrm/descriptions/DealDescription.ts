import type { INodeProperties } from 'n8n-workflow';
import { entityResourceLocator } from '../shared/resourceLocator';
import { limitProperty, returnAllProperty } from '../shared/pagination';
import { idempotencyKeyProperty } from '../shared/idempotency';
import { searchFilter } from '../shared/search';

const showFor = (operation: string[]): INodeProperties['displayOptions'] => ({
	show: { resource: ['deal'], operation },
});

export const dealDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['deal'] } },
		default: 'create',
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a deal',
				routing: { request: { method: 'POST', url: '/v1/deals' } },
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a deal',
				routing: {
					request: { method: 'GET', url: '=/v1/deals/{{ $parameter.deal_id.value || $parameter.deal_id }}' },
				},
			},
			{
				name: 'List',
				value: 'list',
				action: 'List deals',
				routing: { request: { method: 'GET', url: '/v1/deals' } },
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a deal',
				routing: {
					request: {
						method: 'PATCH',
						url: '=/v1/deals/{{ $parameter.deal_id.value || $parameter.deal_id }}',
					},
				},
			},
			{
				name: 'Change Stage',
				value: 'changeStage',
				action: 'Change a deals stage',
				routing: {
					request: {
						method: 'POST',
						url: '=/v1/deals/{{ $parameter.deal_id.value || $parameter.deal_id }}/change-stage',
					},
				},
			},
			{
				name: 'Mark Won',
				value: 'markWon',
				action: 'Mark a deal as won',
				routing: {
					request: {
						method: 'POST',
						url: '=/v1/deals/{{ $parameter.deal_id.value || $parameter.deal_id }}/mark-won',					},
				},
			},
			{
				name: 'Mark Lost',
				value: 'markLost',
				action: 'Mark a deal as lost',
				routing: {
					request: {
						method: 'POST',
						url: '=/v1/deals/{{ $parameter.deal_id.value || $parameter.deal_id }}/mark-lost',					},
				},
			},
			{
				name: 'Reopen',
				value: 'reopen',
				action: 'Reopen a closed deal',
				routing: {
					request: {
						method: 'POST',
						url: '=/v1/deals/{{ $parameter.deal_id.value || $parameter.deal_id }}/reopen',					},
				},
			},
			{
				name: 'Claim',
				value: 'claim',
				action: 'Claim a deal',
				routing: {
					request: {
						method: 'POST',
						url: '=/v1/deals/{{ $parameter.deal_id.value || $parameter.deal_id }}/claim',					},
				},
			},
			{
				name: 'Get Stage History',
				value: 'stageHistory',
				action: 'Get a deals stage history',
				routing: {
					request: {
						method: 'GET',
						url: '=/v1/deals/{{ $parameter.deal_id.value || $parameter.deal_id }}/stage-history',
					},
				},
			},
			{
				name: 'List Tags',
				value: 'listTags',
				action: 'List a deals tags',
				routing: {
					request: {
						method: 'GET',
						url: '=/v1/deals/{{ $parameter.deal_id.value || $parameter.deal_id }}/tags',
					},
				},
			},
			{
				name: 'Add Tags',
				value: 'addTags',
				action: 'Add tags to a deal',
				routing: {
					request: {
						method: 'POST',
						url: '=/v1/deals/{{ $parameter.deal_id.value || $parameter.deal_id }}/tags',
					},
				},
			},
			{
				name: 'Remove Tags',
				value: 'removeTags',
				action: 'Remove tags from a deal',
				routing: {
					request: {
						method: 'DELETE',
						url: '=/v1/deals/{{ $parameter.deal_id.value || $parameter.deal_id }}/tags',
					},
				},
			},
		],
	},

	entityResourceLocator({
		displayName: 'Deal',
		name: 'deal_id',
		required: true,
		searchListMethod: 'searchDeals',
		urlPathSegment: 'deals',
		displayOptions: {
			show: {
				resource: ['deal'],
				operation: [
					'get',
					'update',
					'changeStage',
					'markWon',
					'markLost',
					'reopen',
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
		displayName: 'Title',
		name: 'title',
		type: 'string',
		default: '',
		required: true,
		displayOptions: showFor(['create']),
		routing: { send: { type: 'body', property: 'title' } },
	},
	{
		...entityResourceLocator({
			displayName: 'Pipeline',
			name: 'pipeline_id',
			required: true,
			searchListMethod: 'searchDealPipelines',
			urlPathSegment: 'deal-pipelines',
			displayOptions: showFor(['create']),
		}),
		routing: {
			send: { type: 'body', property: 'pipeline_id', value: '={{ $value.value || $value }}' },
		},
	},
	{
		...entityResourceLocator({
			displayName: 'Stage',
			name: 'stage_id',
			required: true,
			searchListMethod: 'searchDealStages',
			urlPathSegment: 'deal-stages',
			description: 'Pick the pipeline first to load its stages',
			displayOptions: showFor(['create']),
		}),
		routing: {
			send: { type: 'body', property: 'stage_id', value: '={{ $value.value || $value }}' },
		},
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
				displayName: 'Person ID',
				name: 'person_id',
				type: 'string',
				default: '',
				routing: { send: { type: 'body', property: 'person_id' } },
			},
			{
				displayName: 'Organization ID',
				name: 'organization_id',
				type: 'string',
				default: '',
				routing: { send: { type: 'body', property: 'organization_id' } },
			},
			{
				displayName: 'Value',
				name: 'value',
				type: 'number',
				default: 0,
				routing: { send: { type: 'body', property: 'value' } },
			},
			{
				displayName: 'Currency',
				name: 'currency',
				type: 'string',
				default: 'BRL',
				routing: { send: { type: 'body', property: 'currency' } },
			},
			{
				displayName: 'Expected Close Date',
				name: 'expected_close_date',
				type: 'dateTime',
				default: '',
				routing: { send: { type: 'body', property: 'expected_close_date' } },
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

	idempotencyKeyProperty('deal'),

	// ── List ──────────────────────────────────────────────────────────────────
	returnAllProperty({ resource: ['deal'], operation: ['list'] }),
	limitProperty({ resource: ['deal'], operation: ['list'] }),
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add filter',
		default: {},
		displayOptions: showFor(['list']),
		options: [
			searchFilter('title'),
			{
				...entityResourceLocator({
					displayName: 'Pipeline',
					name: 'pipeline_id',
					searchListMethod: 'searchDealPipelines',
					urlPathSegment: 'deal-pipelines',
				}),
				routing: {
					send: { type: 'query', property: 'pipeline_id', value: '={{ $value.value || $value }}' },
				},
			},
			{
				...entityResourceLocator({
					displayName: 'Stage',
					name: 'stage_id',
					searchListMethod: 'searchDealStages',
					urlPathSegment: 'deal-stages',
					description: 'Pick the pipeline first to load its stages',
				}),
				routing: {
					send: { type: 'query', property: 'stage_id', value: '={{ $value.value || $value }}' },
				},
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				default: 'open',
				options: [
					{ name: 'Open', value: 'open' },
					{ name: 'Won', value: 'won' },
					{ name: 'Lost', value: 'lost' },
				],
				routing: { send: { type: 'query', property: 'status' } },
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
				displayName: 'Origin Name or ID',
				name: 'origin_id',
				type: 'options',
				typeOptions: { loadOptionsMethod: 'loadOrigins' },
				default: '',
				description:
					'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				routing: { send: { type: 'query', property: 'origin_id' } },
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
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				routing: { send: { type: 'body', property: 'title' } },
			},
			{
				displayName: 'Value',
				name: 'value',
				type: 'number',
				default: 0,
				routing: { send: { type: 'body', property: 'value' } },
			},
			{
				displayName: 'Currency',
				name: 'currency',
				type: 'string',
				default: '',
				routing: { send: { type: 'body', property: 'currency' } },
			},
			{
				displayName: 'Expected Close Date',
				name: 'expected_close_date',
				type: 'dateTime',
				default: '',
				routing: { send: { type: 'body', property: 'expected_close_date' } },
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
			displayName: 'Stage',
			name: 'stage_id',
			required: true,
			searchListMethod: 'searchDealStages',
			urlPathSegment: 'deal-stages',
			description: 'Pick the deal pipeline first (see "Deal Pipeline" below) to load its stages',
			displayOptions: showFor(['changeStage']),
		}),
		routing: {
			send: { type: 'body', property: 'stage_id', value: '={{ $value.value || $value }}' },
		},
	},
	{
		...entityResourceLocator({
			displayName: 'Deal Pipeline',
			name: 'pipeline_id',
			required: false,
			searchListMethod: 'searchDealPipelines',
			urlPathSegment: 'deal-pipelines',
			description:
				'Populates the Stage dropdown. Pick a different pipeline to move the deal to another funnel (deal must be open); keep the current one to only change stage. Leave empty to change stage within the current pipeline.',
			displayOptions: showFor(['changeStage']),
		}),
		routing: {
			send: {
				type: 'body',
				property: 'pipeline_id',
				value: '={{ (typeof $value === "object" ? $value.value : $value) || undefined }}',
			},
		},
	},

	// ── Mark Won ──────────────────────────────────────────────────────────────
	{
		displayName: 'Won Options',
		name: 'wonOptions',
		type: 'collection',
		placeholder: 'Add field',
		default: {},
		displayOptions: showFor(['markWon']),
		options: [
			{
				displayName: 'Reason (Free Text)',
				name: 'reason_won',
				type: 'string',
				default: '',
				routing: { send: { type: 'body', property: 'reason_won' } },
			},
		],
	},

	// ── Mark Lost ─────────────────────────────────────────────────────────────
	{
		displayName: 'Lost Options',
		name: 'lostOptions',
		type: 'collection',
		placeholder: 'Add field',
		default: {},
		displayOptions: showFor(['markLost']),
		options: [
			{
				...entityResourceLocator({
					displayName: 'Loss Reason',
					name: 'loss_reason_id',
					searchListMethod: 'searchDealLossReasons',
					urlPathSegment: 'loss-reasons',
				}),
				routing: {
					send: { type: 'body', property: 'loss_reason_id', value: '={{ $value.value || $value }}' },
				},
			},
			{
				displayName: 'Reason (Free Text)',
				name: 'reason_lost',
				type: 'string',
				default: '',
				routing: { send: { type: 'body', property: 'reason_lost' } },
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
