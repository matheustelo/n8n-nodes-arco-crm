import type { INodeProperties } from 'n8n-workflow';
import { entityResourceLocator } from '../shared/resourceLocator';
import { limitProperty, returnAllProperty } from '../shared/pagination';

const showFor = (operation: string[]): INodeProperties['displayOptions'] => ({
	show: { resource: ['tag'], operation },
});

export const tagDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['tag'] } },
		default: 'list',
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a tag',
				routing: { request: { method: 'POST', url: '/tags' } },
			},
			{
				name: 'List',
				value: 'list',
				action: 'List tags',
				routing: { request: { method: 'GET', url: '/tags' } },
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a tag',
				routing: {
					request: {
						method: 'PATCH',
						url: '=/tags/{{ $parameter.tag_id.value || $parameter.tag_id }}',
					},
				},
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a tag',
				routing: {
					request: {
						method: 'DELETE',
						url: '=/tags/{{ $parameter.tag_id.value || $parameter.tag_id }}',
					},
				},
			},
		],
	},

	entityResourceLocator({
		displayName: 'Tag',
		name: 'tag_id',
		required: true,
		searchListMethod: 'searchTags',
		urlPathSegment: 'tags',
		displayOptions: { show: { resource: ['tag'], operation: ['update', 'delete'] } },
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
		displayName: 'Color',
		name: 'color',
		type: 'color',
		default: '#3B82F6',
		displayOptions: showFor(['create']),
		routing: { send: { type: 'body', property: 'color' } },
	},

	// ── List ──────────────────────────────────────────────────────────────────
	returnAllProperty({ resource: ['tag'], operation: ['list'] }),
	limitProperty({ resource: ['tag'], operation: ['list'] }),

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
				displayName: 'Color',
				name: 'color',
				type: 'color',
				default: '#3B82F6',
				routing: { send: { type: 'body', property: 'color' } },
			},
		],
	},
];
