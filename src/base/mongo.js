
const mongoose = require('mongoose'),
  { env } = process;

const uri = env.MONGOODB_URL;
mongoose.Promise = global.Promise;

const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false
}

mongoose.connect(uri, options)
  .then(() => {
    console.log(`Connected to DataBase: ${uri}`);
  })
  .catch(error => {
    console.log(`Not connected to DataBase: ${uri}`);
  });

module.exports = {
  mongoose
}