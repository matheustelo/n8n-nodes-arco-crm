import type {
	IExecuteSingleFunctions,
	IHttpRequestOptions,
	INodeProperties,
} from 'n8n-workflow';

const IDEMPOTENCY_HEADER = 'Idempotency-Key';

/**
 * preSend action that injects the optional `Idempotency-Key` header.
 * Only sent when the user provided a value, so the field stays opt-in.
 */
const injectIdempotencyKey = async function (
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const key = (this.getNodeParameter('idempotencyKey', '') as string)?.trim();
	if (key) {
		requestOptions.headers = { ...requestOptions.headers, [IDEMPOTENCY_HEADER]: key };
	}
	return requestOptions;
};

/**
 * Optional Idempotency Key field for the Arco CRM create operations that
 * support it. Same key + same body within 24h returns the original response;
 * reusing the key with a different body returns 409 IDEMPOTENCY_CONFLICT.
 */
export const idempotencyKeyProperty = (
	resource: string,
	operations: string[] = ['create'],
): INodeProperties => ({
	displayName: 'Idempotency Key',
	name: 'idempotencyKey',
	type: 'string',
	default: '',
	placeholder: 'e.g. a UUID per request',
	description:
		'Optional. Sent as the Idempotency-Key header. Same key + same body within 24h returns the original response (prevents duplicates on retries). Reusing the key with a different body returns 409.',
	displayOptions: { show: { resource: [resource], operation: operations } },
	routing: { send: { preSend: [injectIdempotencyKey] } },
});
