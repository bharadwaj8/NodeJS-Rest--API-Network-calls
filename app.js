const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

let dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server running on http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//API 1
app.get("/todos/", async (request, response) => {
  const { status = "", priority = "", search_q = "" } = request.query;

  const getTodoQuery = `
    select * from todo
    where status like '%${status}%'
    and priority like '%${priority}%'
    and todo like '%${search_q}%' order by id;`;
  const dbResponse = await db.all(getTodoQuery);
  response.send(dbResponse);
});

//API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    select * from todo where
    id=${todoId};`;
  const dbResponse = await db.get(getTodoQuery);
  response.send(dbResponse);
});

//API 3
app.post("/todos/", async (request, response) => {
  const getTodoDetails = request.body;
  const { id, todo, priority, status } = getTodoDetails;
  const addTodoQuery = `
    insert into todo(id,todo,priority,status) values(${id},'${todo}','${priority}',
    '${status}');`;
  await db.run(addTodoQuery);
  response.send("Todo Successfully Added");
});

//API 4
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const details = request.body;
  console.log(details);
  const { status, priority, todo } = details;
  if (status !== undefined) {
    const statusQuery = `
        update todo 
        set status='${status}'
        where id=${todoId};`;

    await db.run(statusQuery);

    response.send("Status Updated");
  }
  if (priority !== undefined) {
    const priorityQuery = `
        update todo 
        set priority='${priority}'
        where id=${todoId};`;

    await db.run(priorityQuery);

    response.send("Priority Updated");
  }
  if (todo !== undefined) {
    const todoQuery = `
        update todo 
        set todo='${todo}'
        where id=${todoId};`;

    await db.run(todoQuery);

    response.send("Todo Updated");
  }
});

//API 5
app.delete("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `
    delete from todo where id=${todoId};`;

  await db.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
