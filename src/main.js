import { Client, Databases, 
  // ID, 
  Query } from 'node-appwrite';

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

      } catch(err) {
          return res.json({
              success : false,
              message : 'Tasks and dependencies could not be loaded'
          }, 500, {
              'Access-Control-Allow-Origin': 'http://localhost:3000',
          });
      } 
    }
};
