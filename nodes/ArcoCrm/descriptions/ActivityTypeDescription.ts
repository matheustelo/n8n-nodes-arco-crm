import type { INodeProperties } from 'n8n-workflow';

export const activityTypeDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['activityType'] } },
		default: 'list',
		options: [
			{
				name: 'List',
				value: 'list',
				action: 'List activity types',
				routing: { request: { method: 'GET', url: '/v1/activity-types' } },
			},
		],
	},
];
