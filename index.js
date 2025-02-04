// import { db } from './db/index.js'; 
// import OpenAI from 'openai'; 
// import { todoTable } from './db/schema.js'; 
// import { ilike, eq } from 'drizzle-orm';
// import readlineSync from 'readline-sync';

// const client = new OpenAI();

// const createTodo = async (todo) => {
//   const [result] = await db.insert(todoTable).values({ todo }).returning({ id: todoTable.id });
//   return result.id;
// };

// const getAllTodos = async () => {
//   return await db.select().from(todoTable); 
// };

// const deleteTodoById = async (id) => {
//   return await db.delete(todoTable).where(eq(todoTable.id, id)); 
// };

// const searchTodo = async (search) => {
//   return await db.select().from(todoTable).where(ilike(todoTable.todo, `%${search}%`));
// };

// const tools = {
//   createTodo,
//   getAllTodos,
//   deleteTodoById,
//   searchTodo,
// };

// const SYSTEM_PROMPT = `
// You are an AI To-Do List Assistant with START, PLAN, ACTION, Observation, and Output State.
// Wait for the user prompt and first plan using available tools.
// After planning, take action with appropriate tools and wait for observations based on the action.
// Once you get the observations, return the AI response based on the START prompt and observations.

// You can manage tasks by adding, viewing, updating, and deleting them.
// You must strictly follow the JSON output format.

// Todo DB Schema:
// - id: Int and Primary Key 
// - todo: String 
// - created_at: DateTime
// - updated_at: DateTime

// Available Tools:
// - getAllTodos(): Returns all the Todos from the Database.
// - createTodo(todo: string): Creates a new Todo in the DB and takes 'todo' as a string.
// - deleteTodoById(id: string): Deletes the todo by ID given in the DB.
// - searchTodo(query: string): Searches for all todos matching the query string using iLike in DB.

// Example:
// START
// { "type": "user", "user": "Add a task for shopping groceries." }
// { "type": "plan", "plan": "I will try to get more context on what the user needs to shop." }
// { "type": "output", "output": "Can you tell me what all items you want to shop for?" } 
// { "type": "user", "user": "I want to shop for milk, kurkure, lays, and choco." } 
// { "type": "plan", "plan": "I will use createTodo to create a new Todo in DB." } 
// { "type": "action", "function": "createTodo", "input": "Shopping for milk, kurkure, lays, and choco." }
// { "type": "observation", "observation": 2 }
// { "type": "output", "output": "Your todo has been added successfully." }
// `;

// const messages = [{ role: 'system', content: SYSTEM_PROMPT }];

// while (true) {
//   const query = readlineSync.question('>> ');
//   const userMessage = {
//     type: 'user',
//     user: query,
//   };
//   messages.push({ role: 'user', content: JSON.stringify(userMessage) });

//   while (true) {
//     const chat = await client.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages,
//       response_format: { type: 'json_object' },
//     });

//     const result = chat.choices[0].message.content;
//     messages.push({ role: 'assistant', content: result });

//     const action = JSON.parse(result);

//     if (action.type === 'output') {
//       console.log(`----------- ${action.output} -----------`);
//       break;
//     } else if (action.type === 'action') {
//       const fn = tools[action.function];
//       if (!fn) throw new Error(`Invalid tool called: ${action.function}`);

//       const observation = await fn(action.input);

//       const observationMessage = {
//         type: 'observation',
//         observation,
//       };

//       messages.push({ role: 'developer', content: JSON.stringify(observationMessage) });
//     }
//   }
// }


import { db } from './db/index.js';
import Groq from 'groq-sdk';
import { todoTable } from './db/schema.js';
import { ilike, eq } from 'drizzle-orm';
import readlineSync from 'readline-sync';

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const createTodo = async (todo) => {
  const [result] = await db.insert(todoTable).values({ todo }).returning({ id: todoTable.id });
  return result.id;
};

const getAllTodos = async () => {
  return await db.select().from(todoTable);
};

const deleteTodoById = async (id) => {
  return await db.delete(todoTable).where(eq(todoTable.id, id));
};

const searchTodo = async (search) => {
  return await db.select().from(todoTable).where(ilike(todoTable.todo, `%${search}%`));
};

const tools = {
  createTodo,
  getAllTodos,
  deleteTodoById,
  searchTodo,
};

const SYSTEM_PROMPT = `
You are an AI To-Do List Assistant with START, PLAN, ACTION, Observation, and Output State.
Wait for the user prompt and first plan using available tools.
After planning, take action with appropriate tools and wait for observations based on the action.
Once you get the observations, return the AI response based on the START prompt and observations.

You can manage tasks by adding, viewing, updating, and deleting them.
You must strictly follow the JSON output format.

Todo DB Schema:
- id: Int and Primary Key 
- todo: String 
- created_at: DateTime
- updated_at: DateTime

Available Tools:
- getAllTodos(): Returns all the Todos from the Database.
- createTodo(todo: string): Creates a new Todo in the DB and takes 'todo' as a string.
- deleteTodoById(id: string): Deletes the todo by ID given in the DB.
- searchTodo(query: string): Searches for all todos matching the query string using iLike in DB.

Example:
START
{ "type": "user", "user": "Add a task for shopping groceries." }
{ "type": "plan", "plan": "I will try to get more context on what the user needs to shop." }
{ "type": "output", "output": "Can you tell me what all items you want to shop for?" } 
{ "type": "user", "user": "I want to shop for milk, kurkure, lays, and choco." } 
{ "type": "plan", "plan": "I will use createTodo to create a new Todo in DB." } 
{ "type": "action", "function": "createTodo", "input": "Shopping for milk, kurkure, lays, and choco." }
{ "type": "observation", "observation": 2 }
{ "type": "output", "output": "Your todo has been added successfully." }
`;

const messages = [{ role: 'system', content: SYSTEM_PROMPT }];

while (true) {
  const query = readlineSync.question('>> ');
  const userMessage = {
    type: 'user',
    user: query,
  };
  messages.push({ role: 'user', content: JSON.stringify(userMessage) });

  while (true) {
    const chat = await client.chat.completions.create({
      model: "mixtral-8x7b-32768",
      messages,
      response_format: { type: "json_object" }, // Correct format for Groq API
    });
    
    

    const result = chat.choices[0].message.content;
    messages.push({ role: 'assistant', content: result });

    const action = JSON.parse(result);

    if (action.type === 'output') {
      console.log(`----------- ${action.output} -----------`);
      break;
    } else if (action.type === 'action') {
      const fn = tools[action.function];
      if (!fn) throw new Error(`Invalid tool called: ${action.function}`);

      const observation = await fn(action.input);

      const observationMessage = {
        type: 'observation',
        observation,
      };

      messages.push({ role: 'developer', content: JSON.stringify(observationMessage) });
    }
  }
}