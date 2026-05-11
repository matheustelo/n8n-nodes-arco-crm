import type { INodeProperties, INodePropertyMode } from 'n8n-workflow';

const UUID_REGEX = '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

interface ResourceLocatorOptions {
	displayName: string;
	name: string;
	required?: boolean;
	description?: string;
	displayOptions?: INodeProperties['displayOptions'];
	searchListMethod: string;
	urlPathSegment: string;
}

export function entityResourceLocator(opts: ResourceLocatorOptions): INodeProperties {
	const modes: INodePropertyMode[] = [
		// eslint-disable-next-line n8n-nodes-base/node-param-default-missing
		{
			displayName: 'From List',
			name: 'list',
			type: 'list',
			placeholder: `Select a ${opts.displayName.toLowerCase()}…`,
			typeOptions: {
				searchListMethod: opts.searchListMethod,
				searchable: true,
				searchFilterRequired: false,
			},
		},
		// eslint-disable-next-line n8n-nodes-base/node-param-default-missing
		{
			displayName: 'By ID',
			name: 'id',
			type: 'string',
			placeholder: 'UUID',
			validation: [
				{
					type: 'regex',
					properties: {
						regex: UUID_REGEX,
						errorMessage: 'Not a valid UUID',
					},
				},
			],
		},
		// eslint-disable-next-line n8n-nodes-base/node-param-default-missing
		{
			displayName: 'By URL',
			name: 'url',
			type: 'string',
			placeholder: `https://crm.grupoarco.cc/${opts.urlPathSegment}/…`,
			extractValue: {
				type: 'regex',
				regex: `/${opts.urlPathSegment}/([0-9a-f-]{36})`,
			},
			validation: [
				{
					type: 'regex',
					properties: {
						regex: `.*/${opts.urlPathSegment}/[0-9a-f-]{36}.*`,
						errorMessage: `URL does not contain a valid ${opts.displayName} ID`,
					},
				},
			],
		},
	];

	return {
		displayName: opts.displayName,
		name: opts.name,
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: opts.required ?? false,
		description: opts.description,
		displayOptions: opts.displayOptions,
		modes,
	};
}
