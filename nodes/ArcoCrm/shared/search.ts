import type { INodeProperties } from 'n8n-workflow';

const SEARCH_MAX_LENGTH = 200;

/**
 * Reusable "Search" property for list operations.
 *
 * Maps to the API `search` query param: a case-insensitive substring match that
 * is combined with the other list filters via AND. Capped at 200 characters by
 * the API.
 *
 * @param searchableFields human-readable list of the fields the API matches
 *   against for this resource (e.g. `'name, email or phone'`).
 */
export const searchFilter = (searchableFields: string): INodeProperties => ({
	displayName: 'Search',
	name: 'search',
	type: 'string',
	default: '',
	typeOptions: { maxLength: SEARCH_MAX_LENGTH },
	placeholder: 'e.g. joão',
	description: `Case-insensitive substring search by ${searchableFields}. Combined with the other filters via AND. Max ${SEARCH_MAX_LENGTH} characters.`,
	routing: { send: { type: 'query', property: 'search' } },
});
