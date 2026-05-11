import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class ArcoCrmApi implements ICredentialType {
	name = 'arcoCrmApi';

	displayName = 'Arco CRM API';

	icon: Icon = 'file:../nodes/ArcoCrm/arco.svg';

	documentationUrl = 'https://crm.grupoarco.cc/api/v1/docs';

	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://crm.grupoarco.cc/api',
			placeholder: 'https://crm.grupoarco.cc/api',
			description:
				'Base URL of the Arco CRM API (without trailing slash). Use the staging URL for non-production keys.',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			placeholder: 'ark_...',
			description:
				'API key generated under CRM Settings → API Keys. Must have the scopes for the operations you intend to call.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/v1/leads',
			method: 'GET',
			qs: { limit: 1 },
		},
	};
}
