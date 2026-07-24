import type { INodeProperties } from 'n8n-workflow';

/**
 * "Custom Data" input for an entity's `custom_data` body property.
 *
 * Two modes, toggled by `custom_data_mode` (defaults to `json` so existing saved
 * workflows — which have no value stored for this new toggle — keep behaving
 * exactly as before):
 *  - `json`: the original raw-JSON textarea, unchanged.
 *  - `mapped`: a resourceMapper that fetches the tenant's actual custom field
 *    definitions (via GET /v1/custom-fields) and lets the user pick/fill them,
 *    the same "add a field, it appears" spirit as Traffic Tracking.
 *
 * Only one of the two fields is ever visible at a time, so their `routing.send`
 * never collide on the same `custom_data` body property.
 */
export const customDataFields = (resourceMapperMethod: string): INodeProperties[] => [
	{
		displayName: 'Custom Data Input',
		name: 'custom_data_mode',
		type: 'options',
		default: 'json',
		options: [
			{ name: 'Raw JSON', value: 'json', description: 'Paste a JSON object (legacy behavior, unchanged)' },
			{ name: 'Select Fields', value: 'mapped', description: "Pick the tenant's custom fields from a list" },
		],
	},
	{
		displayName: 'Custom Data (JSON)',
		name: 'custom_data',
		type: 'json',
		default: '{}',
		displayOptions: { show: { custom_data_mode: ['json'] } },
		routing: {
			send: {
				type: 'body',
				property: 'custom_data',
				value: '={{ typeof $value === "string" ? JSON.parse($value || "{}") : $value }}',
			},
		},
	},
	{
		displayName: 'Custom Fields',
		name: 'custom_fields_mapper',
		type: 'resourceMapper',
		default: { mappingMode: 'defineBelow', value: null },
		displayOptions: { show: { custom_data_mode: ['mapped'] } },
		typeOptions: {
			resourceMapper: {
				resourceMapperMethod,
				mode: 'add',
				fieldWords: { singular: 'custom field', plural: 'custom fields' },
				addAllFields: true,
			},
		},
		routing: { send: { type: 'body', property: 'custom_data', value: '={{ $value.value }}' } },
	},
];
