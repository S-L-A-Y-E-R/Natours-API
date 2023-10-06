const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.status(200).json({ app: 'Natours', message: 'Hello from the server!' });
});

const port = 3000;

app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});