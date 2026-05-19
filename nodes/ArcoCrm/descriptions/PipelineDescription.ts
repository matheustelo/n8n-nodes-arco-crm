import type { INodeProperties } from 'n8n-workflow';
import { limitProperty, returnAllProperty } from '../shared/pagination';

const showFor = (operation: string[]): INodeProperties['displayOptions'] => ({
	show: { resource: ['pipeline'], operation },
});

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
				action: 'List pipelines',
				routing: {
					request: {
						method: 'GET',
						url: '=/v1/{{ $parameter.pipelineType }}-pipelines',
					},
				},
			},
		],
	},

	{
		displayName: 'Type',
		name: 'pipelineType',
		type: 'options',
		default: 'lead',
		required: true,
		displayOptions: showFor(['list']),
		options: [
			{ name: 'Lead Pipelines', value: 'lead' },
			{ name: 'Deal Pipelines', value: 'deal' },
		],
		description: 'Whether to list lead or deal pipelines',
	},

	{
		displayName: 'Include Stages',
		name: 'include_stages',
		type: 'boolean',
		default: false,
		description: 'Whether to embed each pipelines stages in the response',
		displayOptions: showFor(['list']),
		routing: { send: { type: 'query', property: 'include_stages' } },
	},

	returnAllProperty({ resource: ['pipeline'], operation: ['list'] }),
	limitProperty({ resource: ['pipeline'], operation: ['list'] }),
];
