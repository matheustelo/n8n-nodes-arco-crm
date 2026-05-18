import type { INodeProperties } from 'n8n-workflow';
import { entityResourceLocator } from '../shared/resourceLocator';
import { limitProperty, returnAllProperty } from '../shared/pagination';

export const membershipDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['membership'] } },
		default: 'list',
		options: [
			{
				name: 'List',
				value: 'list',
				action: 'List memberships',
				routing: { request: { method: 'GET', url: '/v1/memberships' } },
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a membership',
				routing: {
					request: {
						method: 'GET',
						url: '=/v1/memberships/{{ $parameter.membership_id.value || $parameter.membership_id }}',
					},
				},
			},
		],
	},

	entityResourceLocator({
		displayName: 'Membership',
		name: 'membership_id',
		required: true,
		searchListMethod: 'searchMemberships',
		urlPathSegment: 'memberships',
		displayOptions: { show: { resource: ['membership'], operation: ['get'] } },
	}),

	returnAllProperty({ resource: ['membership'], operation: ['list'] }),
	limitProperty({ resource: ['membership'], operation: ['list'] }),
];
