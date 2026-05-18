import type { INodeProperties } from 'n8n-workflow';
import { limitProperty, returnAllProperty } from '../shared/pagination';

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
				name: 'List',
				value: 'list',
				action: 'List tags',
				routing: { request: { method: 'GET', url: '/v1/tags' } },
			},
		],
	},

	returnAllProperty({ resource: ['tag'], operation: ['list'] }),
	limitProperty({ resource: ['tag'], operation: ['list'] }),
];
