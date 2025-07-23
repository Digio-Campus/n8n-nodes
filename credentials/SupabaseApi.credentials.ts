import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class SupabaseApi implements ICredentialType {
	name = 'supabaseApi';
	displayName = 'Supabase API';
	documentationUrl = 'https://supabase.com/docs/guides/api/rest/auth';

	properties: INodeProperties[] = [
		{
			displayName: 'Project URL',
			name: 'host',
			type: 'string',
			placeholder: 'https://your-project-ref.supabase.co',
			default: '',
		},
		{
			displayName: 'API Key',
			name: 'serviceKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				apikey: '={{$credentials.serviceKey}}',
				Authorization: 'Bearer={{$credentials.serviceKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.host}}/rest/v1/',
			url: '',
		},
	};
}
