import {
	NodeConnectionTypes,
	type INodeType,
	type INodeTypeDescription,
} from 'n8n-workflow';

import { leadDescription } from './descriptions/LeadDescription';
import { dealDescription } from './descriptions/DealDescription';
import { personDescription } from './descriptions/PersonDescription';
import { organizationDescription } from './descriptions/OrganizationDescription';
import { activityDescription } from './descriptions/ActivityDescription';
import { noteDescription } from './descriptions/NoteDescription';
import { tagDescription } from './descriptions/TagDescription';
import { pipelineDescription } from './descriptions/PipelineDescription';

import {
	searchLeads,
	searchPeople,
	searchOrganizations,
	searchDeals,
	searchActivities,
	searchTags,
	searchPipelines,
	searchStages,
} from './methods/listSearch';
import {
	loadPipelines,
	loadActivityTypes,
	loadOrigins,
	loadTags,
} from './methods/loadOptions';

export class ArcoCrm implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Arco CRM',
		name: 'arcoCrm',
		icon: 'file:arco.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the Arco CRM Public API',
		defaults: { name: 'Arco CRM' },
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'arcoCrmApi', required: true }],
		requestDefaults: {
			baseURL: '={{ $credentials.baseUrl }}',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				default: 'lead',
				options: [
					{ name: 'Activity', value: 'activity' },
					{ name: 'Deal', value: 'deal' },
					{ name: 'Lead', value: 'lead' },
					{ name: 'Note', value: 'note' },
					{ name: 'Organization', value: 'organization' },
					{ name: 'Person', value: 'person' },
					{ name: 'Pipeline', value: 'pipeline' },
					{ name: 'Tag', value: 'tag' },
				],
			},
			...leadDescription,
			...dealDescription,
			...personDescription,
			...organizationDescription,
			...activityDescription,
			...noteDescription,
			...tagDescription,
			...pipelineDescription,
		],
	};

	methods = {
		listSearch: {
			searchLeads,
			searchPeople,
			searchOrganizations,
			searchDeals,
			searchActivities,
			searchTags,
			searchPipelines,
			searchStages,
		},
		loadOptions: {
			loadPipelines,
			loadActivityTypes,
			loadOrigins,
			loadTags,
		},
	};
}
