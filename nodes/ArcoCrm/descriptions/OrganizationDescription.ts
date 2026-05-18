import type { INodeProperties } from 'n8n-workflow';
import { entityResourceLocator } from '../shared/resourceLocator';
import { limitProperty, returnAllProperty } from '../shared/pagination';

const showFor = (operation: string[]): INodeProperties['displayOptions'] => ({
	show: { resource: ['organization'], operation },
});

export const organizationDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['organization'] } },
		default: 'create',
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create an organization',
				routing: { request: { method: 'POST', url: '/v1/organizations' } },
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get an organization',
				routing: {
					request: {
						method: 'GET',
						url: '=/v1/organizations/{{ $parameter.organization_id.value || $parameter.organization_id }}',
					},
				},
			},
			{
				name: 'List',
				value: 'list',
				action: 'List organizations',
				routing: { request: { method: 'GET', url: '/v1/organizations' } },
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update an organization',
				routing: {
					request: {
						method: 'PATCH',
						url: '=/v1/organizations/{{ $parameter.organization_id.value || $parameter.organization_id }}',
					},
				},
			},
			{
				name: 'Claim',
				value: 'claim',
				action: 'Claim an organization',
				routing: {
					request: {
						method: 'POST',
						url: '=/v1/organizations/{{ $parameter.organization_id.value || $parameter.organization_id }}/claim',
					},
				},
			},
		],
	},

	entityResourceLocator({
		displayName: 'Organization',
		name: 'organization_id',
		required: true,
		searchListMethod: 'searchOrganizations',
		urlPathSegment: 'organizations',
		displayOptions: { show: { resource: ['organization'], operation: ['get', 'update', 'claim'] } },
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
				displayName: 'CNPJ',
				name: 'cnpj',
				type: 'string',
				default: '',
				routing: { send: { type: 'body', property: 'cnpj' } },
			},
			{
				displayName: 'Website',
				name: 'website',
				type: 'string',
				default: '',
				routing: { send: { type: 'body', property: 'website' } },
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
	returnAllProperty({ resource: ['organization'], operation: ['list'] }),
	limitProperty({ resource: ['organization'], operation: ['list'] }),
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
				displayName: 'CNPJ',
				name: 'cnpj',
				type: 'string',
				default: '',
				routing: { send: { type: 'body', property: 'cnpj' } },
			},
			{
				displayName: 'Website',
				name: 'website',
				type: 'string',
				default: '',
				routing: { send: { type: 'body', property: 'website' } },
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
