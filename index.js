import { db } from './db/index'; 
import OpenAI from 'openai'; 
import { todoTable } from './db/schema'; 
import { ilike } from 'drizzle-orm';
import readlineSync from 'readline-sync';

const client = new OpenAI();

const createTodo = async (todo) => {
  const [todo] =  await db.insert(todoTable).values({
    todo
  }).returning({
    id:todoTable.id
  })
  return todo.id
};

const getAllTodos = async() => {
  return await db.select().from(todoTable); 
};

// do be done later
// const updateTodo = (id, updatedTodoText) => {
//   return db
//     .update(todoTable) 
//     .set({
//       todo: updatedTodoText,
//       updatedAt: new Date(), 
//     })
//     .where(todoTable.id.equals(id)); 
// };

const deleteTodoById = (id) => {
    return db.delete(todoTable).where(eq(todoTable.id,id)); 
};
  
const searchTodo = async(search) => {
    return await db.select().from(todoTable).where(ilike(todoTable.todo , `%${search}%`));
};

const tools = {
    createTodo:createTodo,
    getAllTodos:getAllTodos,
    deleteTodoById:deleteTodoById,
    searchTodo:searchTodo
}

const SYSTEM_PROMPT = `
You are an AI To-Do List Assistant. You can manage tasks by adding, viewing, upda You must strictly follow the JSON output format.
Todo DB Schema:
id: Int and Primary Key todo: String created_at: Date
Available Tools:
- ﻿﻿getAllTodos (): Returns all the Todos from Database
- ﻿﻿createTodo (todo: string): Creates a new Todo in the DB and
- ﻿﻿deleteTodoById(id: string): Deleted the todo by ID given in
- ﻿﻿searchTodo(query: string): Searches for all todos matching


Example:
START
( "type": "user", "user": "Add a task for shopping groceries." )
{ "type": "plan", "plan": "I will try to get more context on what user needs to shop." ) 
 { "type": "output", "output": "Can you tell me what all items you want to shop for?" } 
  ("type": "user", "user": "I want to shop for milk, kurkure, layes and choc } 
  { "type": "plan", "plan": "I will use createTodo to create a new Todo in DB.- } 
   ( "type": "action", "function"; "createTodo", "input"; "Shopping Gro"
`

const message = [{role:'system', content: SYSTEM_PROMPT}]

while(true){

}