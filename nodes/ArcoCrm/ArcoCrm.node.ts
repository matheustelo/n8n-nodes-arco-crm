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
import { activityTypeDescription } from './descriptions/ActivityTypeDescription';
import { noteDescription } from './descriptions/NoteDescription';
import { tagDescription } from './descriptions/TagDescription';
import { pipelineDescription } from './descriptions/PipelineDescription';
import { membershipDescription } from './descriptions/MembershipDescription';
import { originDescription } from './descriptions/OriginDescription';

import {
	searchLeads,
	searchPeople,
	searchOrganizations,
	searchDeals,
	searchActivities,
	searchTags,
	searchLeadPipelines,
	searchDealPipelines,
	searchLeadStages,
	searchDealStages,
	searchOrigins,
	searchMemberships,
	searchLossReasons,
} from './methods/listSearch';
import {
	loadLeadPipelines,
	loadDealPipelines,
	loadActivityTypes,
	loadOrigins,
	loadTags,
	loadMemberships,
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
					{ name: 'Activity Type', value: 'activityType' },
					{ name: 'Deal', value: 'deal' },
					{ name: 'Lead', value: 'lead' },
					{ name: 'Membership', value: 'membership' },
					{ name: 'Note', value: 'note' },
					{ name: 'Organization', value: 'organization' },
					{ name: 'Origin', value: 'origin' },
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
			...activityTypeDescription,
			...noteDescription,
			...tagDescription,
			...pipelineDescription,
			...membershipDescription,
			...originDescription,
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
			searchLeadPipelines,
			searchDealPipelines,
			searchLeadStages,
			searchDealStages,
			searchOrigins,
			searchMemberships,
			searchLossReasons,
		},
		loadOptions: {
			loadLeadPipelines,
			loadDealPipelines,
			loadActivityTypes,
			loadOrigins,
			loadTags,
			loadMemberships,
		},
	};
}
