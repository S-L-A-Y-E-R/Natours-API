/* eslint-disable prettier/prettier */
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });

mongoose.connect(process.env.DATABASE);

const app = require('./app');

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
