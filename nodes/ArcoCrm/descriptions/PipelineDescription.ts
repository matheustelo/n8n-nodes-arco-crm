import type { INodeProperties } from 'n8n-workflow';
import { limitProperty, returnAllProperty } from '../shared/pagination';

export const pipelineDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['pipeline'] } },
		default: 'list',
		options: [
			{
				name: 'List',
				value: 'list',
				action: 'List lead pipelines',
				routing: { request: { method: 'GET', url: '/v1/lead-pipelines' } },
			},
		],
	},

	{
		displayName: 'Include Stages',
		name: 'include_stages',
		type: 'boolean',
		default: false,
		description: 'Whether to embed each pipelines stages in the response',
		displayOptions: { show: { resource: ['pipeline'], operation: ['list'] } },
		routing: { send: { type: 'query', property: 'include_stages' } },
	},

	returnAllProperty({ resource: ['pipeline'], operation: ['list'] }),
	limitProperty({ resource: ['pipeline'], operation: ['list'] }),
];
