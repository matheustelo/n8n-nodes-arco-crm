import type { INodeProperties } from 'n8n-workflow';
import { entityResourceLocator } from '../shared/resourceLocator';
import { limitProperty, returnAllProperty } from '../shared/pagination';

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
		],
	},

	entityResourceLocator({
		displayName: 'Deal',
		name: 'deal_id',
		required: true,
		searchListMethod: 'searchDeals',
		urlPathSegment: 'deals',
		displayOptions: { show: { resource: ['deal'], operation: ['get', 'update'] } },
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
		displayName: 'Pipeline ID',
		name: 'pipeline_id',
		type: 'string',
		default: '',
		required: true,
		displayOptions: showFor(['create']),
		description: 'UUID of the deal pipeline. Deal pipelines are not exposed by the Public API — copy the ID from the CRM URL.',
		routing: { send: { type: 'body', property: 'pipeline_id' } },
	},
	{
		displayName: 'Stage ID',
		name: 'stage_id',
		type: 'string',
		default: '',
		required: true,
		displayOptions: showFor(['create']),
		description: 'UUID of the stage within the selected pipeline',
		routing: { send: { type: 'body', property: 'stage_id' } },
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
				routing: { send: { type: 'body', property: 'custom_data' } },
			},
		],
	},

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
			{
				displayName: 'Pipeline ID',
				name: 'pipeline_id',
				type: 'string',
				default: '',
				routing: { send: { type: 'query', property: 'pipeline_id' } },
			},
			{
				displayName: 'Stage ID',
				name: 'stage_id',
				type: 'string',
				default: '',
				routing: { send: { type: 'query', property: 'stage_id' } },
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
				displayName: 'Origin ID',
				name: 'origin_id',
				type: 'string',
				default: '',
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
				routing: { send: { type: 'body', property: 'custom_data' } },
			},
		],
	},
];
