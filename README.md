# ⚡ Bryntum Gantt Node.js REST API Appwrite Function 

## Appwrite collections required

A database with two collections for Bryntum Gantt tasks and dependencies. The tasks collection needs to have [attributes](https://appwrite.io/docs/products/databases/collections#attributes) that match the [Bryntum Gantt Task Model fields](https://bryntum.com/products/gantt/docs/api/Gantt/model/TaskModel#fields), which represent a Bryntum Gantt task. The dependencies collection needs to have attributes that match the [Bryntum Gantt Dependency Model fields](https://bryntum.com/products/gantt/docs/api/Gantt/model/DependencyModel#fields), which represent a Bryntum Gantt dependency.

## 🔒 Environment Variables required

Set the following environmental variables on the function page in your Appwrite console:

- PROJECT_ID 
- DATABASE_ID
- TASKS_COLLECTION_ID
- DEPENDENCIES_COLLECTION_ID

## Authentication

Authenticated requests to this Appwrite function require a JSON Web Token, created using Appwrite [JWT authentication](https://appwrite.io/docs/products/auth/jwt#jwt), in the request's "authorization" header. This authentication makes sure that only logged in users can view or change data. The client side Bryntum Gantt needs to set up Appwrite authentication so that when a user logs in, a session is created using the Appwrite client SDK. The JWT can be created using the session and added to the "authorization" header when making requests to this function.

## 🧰 Usage

### GET

Returns tasks and dependencies data. The returned response uses the [load response structure](https://bryntum.com/products/gantt/docs/guide/Gantt/data/crud_manager_project#load-response-structure) expected by a Bryntum Gantt [Crud Manager](https://bryntum.com/products/gantt/docs/guide/Gantt/data/crud_manager_project) load request.

### POST

Handles POST requests from Bryntum Gantt Crud Manager sync requests. It includes changes for all the linked data stores in a single request, which has a specific [sync request structure](https://bryntum.com/products/gantt/docs/guide/Scheduler/data/crud_manager_in_depth#sync-request-structure). The response has a specific [sync response structure](https://bryntum.com/products/gantt/docs/guide/Gantt/data/crud_manager_project#sync-response-structure) that sends the new `id` of a record created in Appwrite if a record is created. This makes sure that the client side Bryntum Gantt has the correct `id` for the record.

## ⚙️ Configuration

| Setting           | Value         |
| ----------------- | ------------- |
| Runtime           | Node (18.0)   |
| Entrypoint        | `src/main.js` |
| Build Commands    | `npm install` |
| Permissions       | `any`         |
| Timeout (Seconds) | 15            |