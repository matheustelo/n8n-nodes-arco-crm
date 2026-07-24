import type { INodeProperties } from 'n8n-workflow';

/**
 * Reusable "State" + "City" properties for Lead/Person/Organization create & update.
 *
 * Maps to the optional `state` (UF acronym) and `city_ibge_id` (IBGE municipality
 * code) fields. `city` itself is never an input — it's derived server-side and
 * only returned on read. City options load from the state chosen in the same
 * field group (mirrors how Lead/Deal Stage depends on Pipeline).
 */
export const localityFields = (): INodeProperties[] => [
	{
		displayName: 'State Name or ID',
		name: 'state',
		type: 'options',
		typeOptions: { loadOptionsMethod: 'loadStates' },
		default: '',
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		routing: { send: { type: 'body', property: 'state' } },
	},
	{
		displayName: 'City Name or ID',
		name: 'city_ibge_id',
		type: 'options',
		typeOptions: { loadOptionsMethod: 'loadCities', loadOptionsDependsOn: ['state'] },
		default: '',
		description:
			'Pick a state first to load its cities. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		routing: { send: { type: 'body', property: 'city_ibge_id' } },
	},
];
