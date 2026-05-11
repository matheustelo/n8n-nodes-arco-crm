import type { IN8nRequestOperationPaginationGeneric } from 'n8n-workflow';

export const cursorPagination: IN8nRequestOperationPaginationGeneric = {
	type: 'generic',
	properties: {
		continue: '={{ !!$response.body?.meta?.next_cursor }}',
		request: {
			qs: {
				cursor: '={{ $response.body.meta.next_cursor }}',
			},
		},
	},
};

export const returnAllProperty = (showOn: Record<string, string[]>) => ({
	displayName: 'Return All',
	name: 'returnAll',
	type: 'boolean' as const,
	default: false,
	description: 'Whether to return all results or only up to a given limit',
	displayOptions: { show: showOn },
	routing: {
		send: {
			paginate: '={{ $value }}',
		},
		operations: {
			pagination: cursorPagination,
		},
	},
});

export const limitProperty = (showOn: Record<string, string[] | boolean[]>) => ({
	displayName: 'Limit',
	name: 'limit',
	type: 'number' as const,
	default: 50,
	typeOptions: { minValue: 1, maxValue: 100 },
	description: 'Max number of results to return',
	displayOptions: { show: { ...showOn, returnAll: [false] } },
	routing: {
		send: {
			type: 'query' as const,
			property: 'limit',
		},
		output: {
			maxResults: '={{ $value }}',
		},
	},
});
