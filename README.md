# ⚡ Bryntum Gantt Node.js REST API Appwrite function 

## Appwrite collections required

This function requires a database with two collections for the Bryntum Gantt tasks and dependencies data:

- The tasks collection needs to have [attributes](https://appwrite.io/docs/products/databases/collections#attributes) matching the [TaskModel fields](https://bryntum.com/products/gantt/docs/api/Gantt/model/TaskModel#fields) that represent a Bryntum Gantt task.
- The dependencies collection needs to have attributes matching the [DependencyModel fields](https://bryntum.com/products/gantt/docs/api/Gantt/model/DependencyModel#fields) that represent a Bryntum Gantt dependency.

## 🔒 Environment variables required

Set the following environmental variables in your Appwrite console by navigating to the **Settings** tab of the function page:

- PROJECT_ID 
- DATABASE_ID
- TASKS_COLLECTION_ID
- DEPENDENCIES_COLLECTION_ID

## Authentication

Authenticated requests to this function must include a JSON Web Token (JWT) created using Appwrite [JWT authentication](https://appwrite.io/docs/products/auth/jwt#jwt) to ensure that only logged-in users can view or change data.  

We'll set up Appwrite authentication on the client-side Bryntum Gantt and use the Appwrite client SDK to create a session when a user logs in to the app. Then, we'll use the session to create a JWT with Appwrite JWT authentication and add it to the `authorization` header of any requests made to this function.

## 🧰 Usage

### GET

The function returns tasks and dependencies data for GET requests. The returned response uses the [load response structure](https://bryntum.com/products/gantt/docs/guide/Gantt/data/crud_manager_project#load-response-structure) expected by a Bryntum Gantt [Crud Manager](https://bryntum.com/products/gantt/docs/guide/Gantt/data/crud_manager_project) load request.

### POST

The function handles POST requests from Bryntum Gantt Crud Manager sync requests. The Crud Manager includes the changes for multiple linked data stores in a single request, which has a specific [sync request structure](https://bryntum.com/products/gantt/docs/guide/Scheduler/data/crud_manager_in_depth#sync-request-structure). If the changes include the creation of a new record, the function uses the Crud Manager [sync response structure](https://bryntum.com/products/gantt/docs/guide/Gantt/data/crud_manager_project#sync-response-structure) to respond with the `id` of the newly created Appwrite, ensuring the client-side Bryntum Gantt has the correct `id` for the record.

## ⚙️ Configuration

| Setting           | Value         |
| ----------------- | ------------- |
| Runtime           | Node (18.0)   |
| Entrypoint        | `src/main.js` |
| Build Commands    | `npm install` |
| Permissions       | `any`         |
| Timeout (Seconds) | 15            |
