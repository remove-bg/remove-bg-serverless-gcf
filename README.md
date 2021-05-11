# Serverless remove.bg API using Google Cloud Functions
| <img src="/readme_images/remove-bg-logo.svg" height="40"> | <img src="/readme_images/gcf-logo.svg" height="55"> |
| --- | --- |

## What is it?
If you call the [remove.bg API](https://remove.bg/api) you have to provide your API key for authentication. If you are worried about exposing this API key you can set up your own relay function on Google Cloud that injects the API key on the server and forwards all other parameters to the remove.bg API and then returns the result.

* It enhances the security of your front end
* Especially for mobile apps
* Use it as a boilerplate to do all kinds of things that our API can't do

## Supported Cloud Function Providers
| | Provider | URL |
| --- | --- | --- |
| <img src="/readme_images/gcf-logo.svg" height="25"> | Google Cloud Functions | https://github.com/remove-bg/remove-bg-serverless-gcf |
| <img src="/readme_images/azure-functions.svg" height="25"> | Microsoft Azure Functions | https://github.com/remove-bg/remove-bg-serverless-azure |
## Setup your remove.bg relay on Google Cloud Functions

For general reference check out the official docs: https://cloud.google.com/functions/docs/first-nodejs
1. Create a new function with Trigger type `HTTP`
2. Click Save
3. Open `RUNTIME, BUILD AND CONNECTIONS SETTINGS`
4. Add a `Runtime environment variable` called `REMOVE_BG_API_KEY` and set it to your remove.bg API key
5. Click Next
6. Change entry point to `removebg`
7. Copy code of `index.js`and `package.json` into gloud functions console
8. Deploy the function!

## Deploy with command line
1. gcloud config set project `project_name`
2. gcloud functions deploy `project_name` --entry-point removebg --trigger-http --runtime nodejs12 --allow-unauthenticated --set-env-vars REMOVE_BG_API_KEY=<your_api_key>

## Calling the cloud function
1. Navigate to `TRIGGER` in Google Cloud Platform
2. Replace remove.bg API endpoint with this URL
3. Remove your API key from the header of your call

## Local debugging
1. Copy `.env.example` to `.env` and set variable `REMOVE_BG_API_KEY`
2. Install with `npm install`
3. Start with `npm start`
4. Attach with VSCode

