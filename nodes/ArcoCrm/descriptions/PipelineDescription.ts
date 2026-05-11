import type { INodeProperties } from 'n8n-workflow';
import { entityResourceLocator } from '../shared/resourceLocator';
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
				action: 'List pipelines',
				routing: { request: { method: 'GET', url: '/pipelines' } },
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a pipeline',
				routing: {
					request: {
						method: 'GET',
						url: '=/pipelines/{{ $parameter.pipeline_id.value || $parameter.pipeline_id }}',
					},
				},
			},
			{
				name: 'List Stages',
				value: 'listStages',
				action: 'List a pipelines stages',
				routing: {
					request: {
						method: 'GET',
						url: '=/pipelines/{{ $parameter.pipeline_id.value || $parameter.pipeline_id }}/stages',
					},
				},
			},
		],
	},

	entityResourceLocator({
		displayName: 'Pipeline',
		name: 'pipeline_id',
		required: true,
		searchListMethod: 'searchPipelines',
		urlPathSegment: 'pipelines',
		displayOptions: { show: { resource: ['pipeline'], operation: ['get', 'listStages'] } },
	}),

	returnAllProperty({ resource: ['pipeline'], operation: ['list'] }),
	limitProperty({ resource: ['pipeline'], operation: ['list'] }),
];
