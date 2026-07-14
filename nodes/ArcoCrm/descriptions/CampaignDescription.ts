import type {
	IExecuteSingleFunctions,
	IHttpRequestOptions,
	INodeProperties,
} from 'n8n-workflow';
import { entityResourceLocator } from '../shared/resourceLocator';
import { limitProperty, returnAllProperty } from '../shared/pagination';

const showFor = (operation: string[]): INodeProperties['displayOptions'] => ({
	show: { resource: ['campaign'], operation },
});

// Operations that address a single campaign by id (everything except plain list).
const campaignScopedOps = [
	'get',
	'getStages',
	'getSummary',
	'listParticipants',
	'addParticipants',
	'changeParticipantStage',
	'qualifyParticipant',
	'disqualifyParticipant',
	'removeParticipant',
];

// Operations that address a single participant within the campaign.
const participantScopedOps = [
	'changeParticipantStage',
	'qualifyParticipant',
	'disqualifyParticipant',
	'removeParticipant',
];

const campaignUrl = '/v1/campaigns/{{ $parameter.campaign_id.value || $parameter.campaign_id }}';
const participantUrl = `${campaignUrl}/participants/{{ $parameter.participant_id }}`;

/**
 * The qualify endpoint is kind-aware (a lead participant converts the lead; a
 * person participant creates a deal) and its payload varies by kind, so we let
 * the user supply the whole request body as JSON and inject it verbatim.
 */
const injectQualifyBody = async function (
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const raw = this.getNodeParameter('qualifyPayload', '{}') as string | object;
	requestOptions.body = typeof raw === 'string' ? JSON.parse(raw || '{}') : raw;
	return requestOptions;
};

export const campaignDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['campaign'] } },
		default: 'list',
		options: [
			{
				name: 'List',
				value: 'list',
				action: 'List campaigns',
				routing: { request: { method: 'GET', url: '/v1/campaigns' } },
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a campaign',
				routing: { request: { method: 'GET', url: `=${campaignUrl}` } },
			},
			{
				name: 'Get Stages',
				value: 'getStages',
				action: 'Get a campaigns stages',
				routing: { request: { method: 'GET', url: `=${campaignUrl}/stages` } },
			},
			{
				name: 'Get Summary',
				value: 'getSummary',
				action: 'Get a campaigns summary',
				routing: { request: { method: 'GET', url: `=${campaignUrl}/summary` } },
			},
			{
				name: 'List Participants',
				value: 'listParticipants',
				action: 'List campaign participants',
				routing: { request: { method: 'GET', url: `=${campaignUrl}/participants` } },
			},
			{
				name: 'Add Participants',
				value: 'addParticipants',
				action: 'Add participants to a campaign',
				routing: { request: { method: 'POST', url: `=${campaignUrl}/participants` } },
			},
			{
				name: 'Change Participant Stage',
				value: 'changeParticipantStage',
				action: 'Change a participants stage',
				routing: { request: { method: 'POST', url: `=${participantUrl}/stage` } },
			},
			{
				name: 'Qualify Participant',
				value: 'qualifyParticipant',
				action: 'Qualify a participant',
				routing: { request: { method: 'POST', url: `=${participantUrl}/qualify` } },
			},
			{
				name: 'Disqualify Participant',
				value: 'disqualifyParticipant',
				action: 'Disqualify a participant',
				routing: { request: { method: 'POST', url: `=${participantUrl}/disqualify` } },
			},
			{
				name: 'Remove Participant',
				value: 'removeParticipant',
				action: 'Remove a participant from a campaign',
				routing: { request: { method: 'DELETE', url: `=${participantUrl}` } },
			},
		],
	},

	// ── Campaign ID (used by every op except list) ──────────────────────────────
	entityResourceLocator({
		displayName: 'Campaign',
		name: 'campaign_id',
		required: true,
		searchListMethod: 'searchCampaigns',
		urlPathSegment: 'campaigns',
		displayOptions: { show: { resource: ['campaign'], operation: campaignScopedOps } },
	}),

	// ── Participant ID (participant-scoped ops) ─────────────────────────────────
	{
		displayName: 'Participant ID',
		name: 'participant_id',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'UUID',
		description: 'UUID of the participant (from List Participants)',
		displayOptions: { show: { resource: ['campaign'], operation: participantScopedOps } },
	},

	// ── List / List Participants pagination ─────────────────────────────────────
	returnAllProperty({ resource: ['campaign'], operation: ['list', 'listParticipants'] }),
	limitProperty({ resource: ['campaign'], operation: ['list', 'listParticipants'] }),

	// ── List Participants filters ───────────────────────────────────────────────
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add filter',
		default: {},
		displayOptions: showFor(['listParticipants']),
		options: [
			{
				...entityResourceLocator({
					displayName: 'Stage',
					name: 'stage_id',
					searchListMethod: 'searchCampaignStages',
					urlPathSegment: 'campaign-stages',
					description: 'Filter by campaign stage',
				}),
				routing: {
					send: { type: 'query', property: 'stage_id', value: '={{ $value.value || $value }}' },
				},
			},
			{
				displayName: 'Outcome',
				name: 'outcome',
				type: 'options',
				default: 'active',
				options: [
					{ name: 'Active', value: 'active' },
					{ name: 'Qualified', value: 'qualified' },
					{ name: 'Disqualified', value: 'disqualified' },
				],
				routing: { send: { type: 'query', property: 'outcome' } },
			},
		],
	},

	// ── Add Participants ────────────────────────────────────────────────────────
	{
		displayName: 'Lead IDs',
		name: 'leads',
		type: 'string',
		typeOptions: { multipleValues: true, multipleValueButtonText: 'Add Lead ID' },
		default: [],
		placeholder: 'Lead UUID',
		description: 'Lead UUIDs to add as participants (lead must be open)',
		displayOptions: showFor(['addParticipants']),
		routing: {
			send: {
				type: 'body',
				property: 'leads',
				value: '={{ $value && $value.length ? $value : undefined }}',
			},
		},
	},
	{
		displayName: 'Person IDs',
		name: 'people',
		type: 'string',
		typeOptions: { multipleValues: true, multipleValueButtonText: 'Add Person ID' },
		default: [],
		placeholder: 'Person UUID',
		description: 'Person UUIDs to add as participants',
		displayOptions: showFor(['addParticipants']),
		routing: {
			send: {
				type: 'body',
				property: 'people',
				value: '={{ $value && $value.length ? $value : undefined }}',
			},
		},
	},
	{
		displayName: 'Force',
		name: 'force',
		type: 'boolean',
		default: false,
		description:
			'Whether to bypass the cross-type identity guard (add even if the same identity already participates as the other kind)',
		displayOptions: showFor(['addParticipants']),
		routing: { send: { type: 'body', property: 'force', value: '={{ $value ? true : undefined }}' } },
	},

	// ── Change Participant Stage ────────────────────────────────────────────────
	{
		...entityResourceLocator({
			displayName: 'Stage',
			name: 'campaign_stage_id',
			required: true,
			searchListMethod: 'searchCampaignStages',
			urlPathSegment: 'campaign-stages',
			description: 'Target stage — must belong to the selected campaign',
			displayOptions: showFor(['changeParticipantStage']),
		}),
		routing: {
			send: { type: 'body', property: 'campaign_stage_id', value: '={{ $value.value || $value }}' },
		},
	},

	// ── Qualify Participant ─────────────────────────────────────────────────────
	{
		displayName: 'Qualify Payload (JSON)',
		name: 'qualifyPayload',
		type: 'json',
		default: '{}',
		description:
			'Request body. Kind-aware: a lead participant converts the lead (person/organization/deal actions); a person participant creates a deal. Mismatched payloads return QUALIFY_PAYLOAD_MISMATCH.',
		displayOptions: showFor(['qualifyParticipant']),
		routing: { send: { preSend: [injectQualifyBody] } },
	},

	// ── Disqualify Participant ──────────────────────────────────────────────────
	{
		displayName: 'Disqualify Options',
		name: 'disqualifyOptions',
		type: 'collection',
		placeholder: 'Add field',
		default: {},
		displayOptions: showFor(['disqualifyParticipant']),
		options: [
			{
				...entityResourceLocator({
					displayName: 'Loss Reason',
					name: 'loss_reason_id',
					searchListMethod: 'searchLeadLossReasons',
					urlPathSegment: 'loss-reasons',
				}),
				routing: {
					send: { type: 'body', property: 'loss_reason_id', value: '={{ $value.value || $value }}' },
				},
			},
			{
				displayName: 'Comment',
				name: 'comment',
				type: 'string',
				default: '',
				routing: { send: { type: 'body', property: 'comment' } },
			},
		],
	},
];
