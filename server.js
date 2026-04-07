// Creamos un servidor usando express
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const usersRouter = require('./routes/users');

app.use(express.json());
app.use('/users', usersRouter);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

module.exports = app;
