# n8n-nodes-supabaseupsert

This is an n8n community node. It lets you use Supabase's upsert functionality in your n8n workflows.

Supabase is an open-source Firebase alternative that provides a suite of tools for building applications, including a real-time database, authentication, and storage.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Usage](#usage)  
[Resources](#resources)  

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

A create or update operation that inserts rows or updates existing rows in a Supabase table. If the row already exists, it will be updated with the provided data. If it does not exist, a new row will be created.

Right now, the only resource supported is CSV files. The node can read a CSV file from the input, parse it, and then perform the upsert operation on the specified Supabase table.

## Credentials

You need to create a Supabase service account and obtain the API key and URL to use this node. You can find instructions on how to do this in the [Supabase documentation](https://supabase.com/docs/guides/platform/api).

Then, you need to configure the credentials in n8n by going to the credentials section and adding a new credential of type "Test_Supabase". Enter the API key and URL you obtained earlier.

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* [Supabase documentation](https://supabase.com/docs)
