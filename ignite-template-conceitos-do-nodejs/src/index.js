const express = require('express');
const cors = require('cors');

 const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

 const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if (!user) {
    return response.json({ error: "User not found" }).status(404);
  }

  request.user = user;

  return next();

}


app.post('/users', (request, response) => {
   const { name, username } = request.body;
   const checkUsername = users.find(user => user.username === username);
   
   if (checkUsername) {
    return response.status(400).json({ error: "Username is already in use." });
   };

   const user = {
      id: uuidv4(),
      name,
      username,
      todos: []
   };

   users.push(user);

   response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title, 
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(todo);

  return response.status(201).send(todo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body; 

  const todoToUpdate = user.todos.find(todo => todo.id === id);
  if (!todoToUpdate) {
    return response.status(404).json({ error: "There is no todo created with this id." });
  }

  todoToUpdate.title = title;
  todoToUpdate.deadline = new Date(deadline);

  return response.json(todoToUpdate);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoToUpdate = user.todos.find(todo => todo.id === id);
  
  if (!todoToUpdate) {
    return response.status(404).json({ error: "There is no todo created with this id." });
  }

  todoToUpdate.done = true;

  return response.json(todoToUpdate);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoToDelete = user.todos.findIndex(todo => todo.id === id);
  
  if (todoToDelete === -1) {
    return response.status(404).json({ error: "There is no todo created with this id." });
  }

  user.todos.splice(todoToDelete, 1);

  return response.status(204).json();
});

module.exports = app;