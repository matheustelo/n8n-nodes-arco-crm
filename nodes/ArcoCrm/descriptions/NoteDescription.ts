import type { INodeProperties } from 'n8n-workflow';
import { limitProperty, returnAllProperty } from '../shared/pagination';
import { idempotencyKeyProperty } from '../shared/idempotency';

const showFor = (operation: string[]): INodeProperties['displayOptions'] => ({
	show: { resource: ['note'], operation },
});

const entityTypeOptions = [
	{ name: 'Lead', value: 'lead' },
	{ name: 'Deal', value: 'deal' },
	{ name: 'Person', value: 'person' },
	{ name: 'Organization', value: 'organization' },
];

export const noteDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['note'] } },
		default: 'create',
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a note',
				routing: { request: { method: 'POST', url: '/v1/notes' } },
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a note',
				routing: { request: { method: 'GET', url: '=/v1/notes/{{ $parameter.note_id }}' } },
			},
			{
				name: 'List',
				value: 'list',
				action: 'List notes for an entity',
				routing: { request: { method: 'GET', url: '/v1/notes' } },
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a note',
				routing: { request: { method: 'PATCH', url: '=/v1/notes/{{ $parameter.note_id }}' } },
			},
		],
	},

	{
		displayName: 'Note ID',
		name: 'note_id',
		type: 'string',
		default: '',
		required: true,
		displayOptions: showFor(['get', 'update']),
	},

	// ── Create body ──────────────────────────────────────────────────────────
	{
		displayName: 'Content',
		name: 'content',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '',
		required: true,
		displayOptions: showFor(['create']),
		routing: { send: { type: 'body', property: 'content' } },
	},
	{
		displayName: 'Entity Type',
		name: 'entity_type',
		type: 'options',
		default: 'lead',
		required: true,
		displayOptions: showFor(['create']),
		options: entityTypeOptions,
		routing: { send: { type: 'body', property: 'entity_type' } },
	},
	{
		displayName: 'Entity ID',
		name: 'entity_id',
		type: 'string',
		default: '',
		required: true,
		displayOptions: showFor(['create']),
		description: 'UUID of the lead/deal/person/organization the note is attached to',
		routing: { send: { type: 'body', property: 'entity_id' } },
	},

	idempotencyKeyProperty('note'),

	// ── List filters (sent as query, required by API) ────────────────────────
	{
		displayName: 'Entity Type',
		name: 'entity_type_filter',
		type: 'options',
		default: 'lead',
		required: true,
		displayOptions: showFor(['list']),
		options: entityTypeOptions,
		routing: { send: { type: 'query', property: 'entity_type' } },
	},
	{
		displayName: 'Entity ID',
		name: 'entity_id_filter',
		type: 'string',
		default: '',
		required: true,
		displayOptions: showFor(['list']),
		description: 'UUID of the entity whose notes you want to list',
		routing: { send: { type: 'query', property: 'entity_id' } },
	},
	returnAllProperty({ resource: ['note'], operation: ['list'] }),
	limitProperty({ resource: ['note'], operation: ['list'] }),

	// ── Update ────────────────────────────────────────────────────────────────
	{
		displayName: 'Content',
		name: 'updateContent',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '',
		required: true,
		displayOptions: showFor(['update']),
		routing: { send: { type: 'body', property: 'content' } },
	},
];
