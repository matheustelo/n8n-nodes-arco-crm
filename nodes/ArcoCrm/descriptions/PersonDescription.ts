import type { INodeProperties } from 'n8n-workflow';
import { entityResourceLocator } from '../shared/resourceLocator';
import { limitProperty, returnAllProperty } from '../shared/pagination';

const showFor = (operation: string[]): INodeProperties['displayOptions'] => ({
	show: { resource: ['person'], operation },
});

export const personDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['person'] } },
		default: 'create',
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a person',
				routing: { request: { method: 'POST', url: '/v1/people' } },
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a person',
				routing: {
					request: {
						method: 'GET',
						url: '=/v1/people/{{ $parameter.person_id.value || $parameter.person_id }}',
					},
				},
			},
			{
				name: 'List',
				value: 'list',
				action: 'List people',
				routing: { request: { method: 'GET', url: '/v1/people' } },
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a person',
				routing: {
					request: {
						method: 'PATCH',
						url: '=/v1/people/{{ $parameter.person_id.value || $parameter.person_id }}',
					},
				},
			},
			{
				name: 'Claim',
				value: 'claim',
				action: 'Claim a person',
				routing: {
					request: {
						method: 'POST',
						url: '=/v1/people/{{ $parameter.person_id.value || $parameter.person_id }}/claim',
					},
				},
			},
		],
	},

	entityResourceLocator({
		displayName: 'Person',
		name: 'person_id',
		required: true,
		searchListMethod: 'searchPeople',
		urlPathSegment: 'people',
		displayOptions: { show: { resource: ['person'], operation: ['get', 'update', 'claim'] } },
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
				displayName: 'Organization ID',
				name: 'organization_id',
				type: 'string',
				default: '',
				routing: { send: { type: 'body', property: 'organization_id' } },
			},
			{
				displayName: 'Owner Membership ID',
				name: 'owner_membership_id',
				type: 'string',
				default: '',
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
	returnAllProperty({ resource: ['person'], operation: ['list'] }),
	limitProperty({ resource: ['person'], operation: ['list'] }),
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add filter',
		default: {},
		displayOptions: showFor(['list']),
		options: [
			{
				displayName: 'Organization ID',
				name: 'organization_id',
				type: 'string',
				default: '',
				routing: { send: { type: 'query', property: 'organization_id' } },
			},
			{
				displayName: 'Owner Membership ID',
				name: 'owner_membership_id',
				type: 'string',
				default: '',
				routing: { send: { type: 'query', property: 'owner_membership_id' } },
			},
			{
				displayName: 'Unassigned',
				name: 'unassigned',
				type: 'boolean',
				default: false,
				routing: { send: { type: 'query', property: 'unassigned' } },
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
				displayName: 'Organization ID',
				name: 'organization_id',
				type: 'string',
				default: '',
				routing: { send: { type: 'body', property: 'organization_id' } },
			},
			{
				displayName: 'Owner Membership ID',
				name: 'owner_membership_id',
				type: 'string',
				default: '',
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
