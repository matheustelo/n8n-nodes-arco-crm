import type { INodeProperties } from 'n8n-workflow';
import { entityResourceLocator } from '../shared/resourceLocator';
import { limitProperty, returnAllProperty } from '../shared/pagination';
import { idempotencyKeyProperty } from '../shared/idempotency';

const showFor = (operation: string[]): INodeProperties['displayOptions'] => ({
	show: { resource: ['activity'], operation },
});

export const activityDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['activity'] } },
		default: 'create',
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create an activity',
				routing: { request: { method: 'POST', url: '/v1/activities' } },
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get an activity',
				routing: {
					request: {
						method: 'GET',
						url: '=/v1/activities/{{ $parameter.activity_id.value || $parameter.activity_id }}',
					},
				},
			},
			{
				name: 'List',
				value: 'list',
				action: 'List activities',
				routing: { request: { method: 'GET', url: '/v1/activities' } },
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update an activity',
				routing: {
					request: {
						method: 'PATCH',
						url: '=/v1/activities/{{ $parameter.activity_id.value || $parameter.activity_id }}',
					},
				},
			},
			{
				name: 'Complete',
				value: 'complete',
				action: 'Mark an activity complete',
				routing: {
					request: {
						method: 'POST',
						url: '=/v1/activities/{{ $parameter.activity_id.value || $parameter.activity_id }}/complete',
					},
				},
			},
		],
	},

	entityResourceLocator({
		displayName: 'Activity',
		name: 'activity_id',
		required: true,
		searchListMethod: 'searchActivities',
		urlPathSegment: 'activities',
		displayOptions: {
			show: {
				resource: ['activity'],
				operation: ['get', 'update', 'complete'],
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
		displayName: 'Activity Type Name or ID',
		name: 'type_id',
		type: 'options',
		typeOptions: { loadOptionsMethod: 'loadActivityTypes' },
		default: '',
		required: true,
		displayOptions: showFor(['create']),
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		routing: { send: { type: 'body', property: 'type_id' } },
	},
	entityResourceLocator({
		displayName: 'Owner Membership',
		name: 'owner_membership_id',
		required: true,
		searchListMethod: 'searchMemberships',
		urlPathSegment: 'memberships',
		displayOptions: showFor(['create']),
	}),
	{
		displayName: 'Related Type',
		name: 'related_type',
		type: 'options',
		default: 'lead',
		required: true,
		displayOptions: showFor(['create']),
		options: [
			{ name: 'Lead', value: 'lead' },
			{ name: 'Deal', value: 'deal' },
			{ name: 'Person', value: 'person' },
			{ name: 'Organization', value: 'organization' },
		],
		routing: { send: { type: 'body', property: 'related_type' } },
	},
	{
		displayName: 'Related ID',
		name: 'related_id',
		type: 'string',
		default: '',
		required: true,
		displayOptions: showFor(['create']),
		description: 'UUID of the linked entity',
		routing: { send: { type: 'body', property: 'related_id' } },
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
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				typeOptions: { rows: 3 },
				default: '',
				routing: { send: { type: 'body', property: 'notes' } },
			},
			{
				displayName: 'Due At',
				name: 'due_at',
				type: 'dateTime',
				default: '',
				routing: { send: { type: 'body', property: 'due_at' } },
			},
		],
	},

	idempotencyKeyProperty('activity'),

	// ── List ──────────────────────────────────────────────────────────────────
	returnAllProperty({ resource: ['activity'], operation: ['list'] }),
	limitProperty({ resource: ['activity'], operation: ['list'] }),
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add filter',
		default: {},
		displayOptions: showFor(['list']),
		options: [
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
				displayName: 'Related Type',
				name: 'related_type',
				type: 'options',
				default: 'lead',
				options: [
					{ name: 'Lead', value: 'lead' },
					{ name: 'Deal', value: 'deal' },
					{ name: 'Person', value: 'person' },
					{ name: 'Organization', value: 'organization' },
				],
				routing: { send: { type: 'query', property: 'related_type' } },
			},
			{
				displayName: 'Related ID',
				name: 'related_id',
				type: 'string',
				default: '',
				routing: { send: { type: 'query', property: 'related_id' } },
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				default: 'pending',
				options: [
					{ name: 'Pending', value: 'pending' },
					{ name: 'Done', value: 'done' },
				],
				routing: { send: { type: 'query', property: 'status' } },
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
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				typeOptions: { rows: 3 },
				default: '',
				routing: { send: { type: 'body', property: 'notes' } },
			},
			{
				displayName: 'Due At',
				name: 'due_at',
				type: 'dateTime',
				default: '',
				routing: { send: { type: 'body', property: 'due_at' } },
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
		],
	},
];
