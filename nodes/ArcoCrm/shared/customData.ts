import type { INodeProperties } from 'n8n-workflow';

/**
 * "Custom Data" inputs for an entity's `custom_data` body property.
 *
 * Two independent, always-visible collection options — same idiom as Traffic
 * Tracking sitting next to Custom Data next to Campaign, all optional add-ons
 * a user picks from "Add field":
 *  - `Custom Data (JSON)`: the original raw-JSON textarea, byte-for-byte
 *    unchanged so existing saved workflows keep behaving exactly as before.
 *  - `Custom Fields`: a resourceMapper that fetches the tenant's actual custom
 *    field definitions (via GET /v1/custom-fields) and lets the user pick/fill
 *    them, the same "add a field, it appears" spirit as Traffic Tracking.
 *
 * Deliberately NOT gated behind a mode toggle: displayOptions.show conditions
 * between two options of the same `collection` only resolve once BOTH options
 * have been materialized in the stored parameters, which isn't the case for
 * workflows saved before this field existed — that gating silently dropped
 * `custom_data` from the request for pre-existing workflows. Keeping both
 * options unconditional avoids that trap entirely. Fill only one of the two;
 * if both are added, whichever the user added last in the UI wins.
 */
export const customDataFields = (resourceMapperMethod: string): INodeProperties[] => [
	{
		displayName: 'Custom Data (JSON)',
		name: 'custom_data',
		type: 'json',
		default: '{}',
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
		description: "Alternative to Custom Data (JSON) above — pick the tenant's custom fields instead of pasting raw JSON. Use one or the other, not both.",
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
