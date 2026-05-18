import type { INodeProperties } from 'n8n-workflow';
import { entityResourceLocator } from '../shared/resourceLocator';
import { limitProperty, returnAllProperty } from '../shared/pagination';

export const originDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['origin'] } },
		default: 'list',
		options: [
			{
				name: 'List',
				value: 'list',
				action: 'List origins',
				routing: { request: { method: 'GET', url: '/v1/origins' } },
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get an origin',
				routing: {
					request: {
						method: 'GET',
						url: '=/v1/origins/{{ $parameter.origin_id.value || $parameter.origin_id }}',
					},
				},
			},
		],
	},

	entityResourceLocator({
		displayName: 'Origin',
		name: 'origin_id',
		required: true,
		searchListMethod: 'searchOrigins',
		urlPathSegment: 'origins',
		displayOptions: { show: { resource: ['origin'], operation: ['get'] } },
	}),

	returnAllProperty({ resource: ['origin'], operation: ['list'] }),
	limitProperty({ resource: ['origin'], operation: ['list'] }),
];
