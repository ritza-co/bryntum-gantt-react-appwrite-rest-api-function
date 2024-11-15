import { Client, Databases, ID, Query } from 'node-appwrite';

const PROJECT_ID = process.env.PROJECT_ID;
const DATABASE_ID = process.env.DATABASE_ID;
const TASKS_COLLECTION_ID = process.env.TASKS_COLLECTION_ID;
const DEPENDENCIES_COLLECTION_ID = process.env.DEPENDENCIES_COLLECTION_ID;

export default async ({ req, res }) => {
    const client = new Client()
        .setEndpoint('https://cloud.appwrite.io/v1')
        .setProject(PROJECT_ID)
        .setJWT(req.headers['authorization']);

    const databases = new Databases(client);

    async function addTask(task) {
        const { $id } = await databases.createDocument(
            DATABASE_ID,
            TASKS_COLLECTION_ID,
            ID.unique(),
            task
        );
        return $id;
    }

    async function removeTask(id) {
        await databases.deleteDocument(DATABASE_ID, TASKS_COLLECTION_ID, id);
    }

    async function updateTask(id, task) {
        await databases.updateDocument(DATABASE_ID, TASKS_COLLECTION_ID, id, task);
    }

    async function addDependency(dependency) {
        dependency.type = `${dependency.type}`;
        delete dependency.from;
        delete dependency.to;
        const { $id } = await databases.createDocument(
            DATABASE_ID,
            DEPENDENCIES_COLLECTION_ID,
            ID.unique(),
            dependency
        );
        return $id; 
    }

    async function removeDependency(id) {
        await databases.deleteDocument(DATABASE_ID, DEPENDENCIES_COLLECTION_ID, id);
    }

    async function updateDependency(id, dependency) {
        await databases.updateDocument(DATABASE_ID, DEPENDENCIES_COLLECTION_ID, id, dependency);
    }

    function createOperation(added, table) {
        return Promise.all(
            added.map(async(record) => {
                const { $PhantomId, ...data } = record;
                let id;
                if (table === 'tasks') {
                    id = await addTask(data);
                }
                if (table === 'dependencies') {
                    id = await addDependency(data);
                }
                // Report to the client that the record identifier has been changed
                return { $PhantomId, id };
            })
        );
    }

    function deleteOperation(deleted, table) {
        return Promise.all(
            deleted.map(({ id }) => {
                if (table === 'tasks') {
                    removeTask(id);
                }
                if (table === 'dependencies') {
                    removeDependency(id);
                }
            })
        );
    }  

    function updateOperation(updated, table) {
        return Promise.all(
            updated.map(({ $PhantomId, id, ...data }) => {
                if (table === 'tasks') {
                    updateTask(id, data);
                }
                if (table === 'dependencies') {
                    updateDependency(id, data);
                }
            })
        );
    }

    async function applyTableChanges(table, changes) {
        let rows;
        if (changes.added) {
            rows = await createOperation(changes.added, table);
        }
        if (changes.removed) {
          await deleteOperation(changes.removed, table);
        }
        if (changes.updated) {
            await updateOperation(changes.updated, table);
        }
        // new task or dependency ids to send to the client
        return rows;
    }

    if (req.method === 'OPTIONS') {
        return res.send('', 200, {
          'Access-Control-Allow-Origin': 'http://localhost:3000',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        })
    }

    if (req.method === 'GET') {
        try {
            const tasksResponse = await databases.listDocuments(
                DATABASE_ID,
                TASKS_COLLECTION_ID,
                [Query.orderAsc('parentIndex')]
            );

            const tasks = tasksResponse.documents.map((task) => {
                task.id = task.$id;
                // remove AppWrite-specific fields and fields that are null or undefined
                const obj = Object.fromEntries(Object.entries(task).filter(([_, v]) => v != null ).filter(([k, _]) => k[0] != '$'));
                return obj;
            });

            const dependenciesResponse = await databases.listDocuments(
                DATABASE_ID,
                DEPENDENCIES_COLLECTION_ID
            );

            const dependencies = dependenciesResponse.documents.map((dep) => {
                dep.id = dep.$id;
                // remove AppWrite-specific fields and fields that are null or undefined
                const obj = Object.fromEntries(Object.entries(dep).filter(([_, v]) => v != null).filter(([k, _]) => k[0] != '$'));
                return obj;
            });
        
            return res.json({
                success : true,
                tasks   : {
                    rows : tasks
                },
                dependencies : {
                    rows : dependencies
                }
            }, 200, {
                'Access-Control-Allow-Origin': 'http://localhost:3000',
            });
        } 
        catch(err) {
            return res.json({
                success : false,
                message : 'Tasks and dependencies could not be loaded'
            }, 500, {
                'Access-Control-Allow-Origin': 'http://localhost:3000',
            });
        } 
    }

    if (req.method === "POST") {
        const { requestId, tasks, dependencies } = req.body;
        try {
            const response = { requestId, success : true };
            // if task changes are passed
            if (tasks) {
                const rows = await applyTableChanges('tasks', tasks);
                // if got some new data to update client
                if (rows) {
                    response.tasks = { rows };
                }
            }
            // if dependency changes are passed
            if (dependencies) {
                const rows = await applyTableChanges('dependencies', dependencies);
                // if got some new data to update client
                if (rows) {
                    response.dependencies = { rows };
                }
            }
            return res.json(response, 200, {
                'Access-Control-Allow-Origin': 'http://localhost:3000',
            });
        }
        catch(err) {
            return res.json({
                requestId,
                success : false,
                message : 'There was an error syncing the data changes'
            }, 500, {
              'Access-Control-Allow-Origin': 'http://localhost:3000',
            });
        }
    }
};