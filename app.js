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
    and todo like '%${search_q}%';`;
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
