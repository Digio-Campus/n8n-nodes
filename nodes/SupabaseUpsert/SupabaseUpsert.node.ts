import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	NodeConnectionType,
} from 'n8n-workflow';

export class SupabaseUpsert implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Supabase Upsert',
		name: 'supabaseUpsert',
		icon: 'file:icons8-supabase.svg',
		group: ['database'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Create or Update a table using CSV data into Supabase',
		defaults: {
			name: 'Supabase Upsert',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'test_SupabaseApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'CSV Data',
						value: 'csvData',
					},
				],
				default: 'csvData',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['csvData'],
					},
				},
				options: [
					{
						name: 'Create or Update',
						value: 'upsert',
						action: 'Upsert CSV data into table',
						description:
							'Create a new record, or update the current one if it already exists (upsert)',
					},
				],
				default: 'upsert',
			},
			{
				displayName: 'Table Name',
				name: 'tableName',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['csvData'],
						operation: ['upsert'],
					},
				},
				default: '',
				placeholder: 'users',
				description: 'Name of the table to insert/update data into',
				required: true,
			},
			{
				displayName: 'Binary Property Name',
				name: 'binaryPropertyName',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['csvData'],
						operation: ['upsert'],
					},
				},
				default: 'data',
				placeholder: 'data',
				description: 'Name of the binary property containing the CSV file',
				required: true,
			},
			{
				displayName: 'Conflict Resolution',
				name: 'conflictResolution',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['csvData'],
						operation: ['upsert'],
					},
				},
				options: [
					{
						name: 'Merge Duplicates',
						value: 'merge-duplicates',
						description: 'Update existing records, insert new ones',
					},
					{
						name: 'Ignore Duplicates',
						value: 'ignore-duplicates',
						description: 'Keep existing records, insert new ones only',
					},
				],
				default: 'merge-duplicates',
				description: 'How to handle duplicate records',
			},
			{
				displayName: 'On Conflict Columns',
				name: 'onConflictColumns',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['csvData'],
						operation: ['upsert'],
					},
				},
				default: '',
				placeholder: 'ID,email',
				description:
					'Comma-separated list of columns to use for conflict detection. Leave empty to use primary key.',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Get credentials
		const credentials = await this.getCredentials('test_SupabaseApi');
		const baseUrl = credentials.host as string;
		const apiKey = credentials.serviceKey as string;

		// Get resource and operation
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === 'csvData' && operation === 'upsert') {
					const tableName = this.getNodeParameter('tableName', i) as string;
					const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
					const conflictResolution = this.getNodeParameter('conflictResolution', i) as string;
					const onConflictColumns = this.getNodeParameter('onConflictColumns', i) as string;

					// Get binary data
					this.helpers.assertBinaryData(i, binaryPropertyName);
					const csvBuffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);

					// Prepare headers
					const headers: { [key: string]: string } = {
						apikey: apiKey,
						Authorization: `Bearer=${apiKey}`,
						'Content-Type': 'text/csv',
						Accept: 'application/json',
						Prefer: `resolution=${conflictResolution}`,
					};

					// Add on-conflict columns if specified
					if (onConflictColumns.trim()) {
						headers['Prefer'] += `,on-conflict=${onConflictColumns.trim()}`;
					}

					// Make request to Supabase
					const url = `${baseUrl}/rest/v1/${tableName}`;

					const response = await this.helpers.httpRequest({
						method: 'POST',
						url,
						headers,
						body: csvBuffer,
					});

					returnData.push({
						json: {
							success: true,
							table: tableName,
							response: response,
							rowsAffected: Array.isArray(response) ? response.length : 1,
						},
						pairedItem: { item: i },
					});
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
							success: false,
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
