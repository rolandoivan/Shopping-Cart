let mongoose = require('mongoose'); // Returns singleton object
mongoose.set('useCreateIndex', true); 
const server = 'localhost'
const database = 'store';      

class Database {
  constructor() {
    this._connect()
  }
  
_connect() {
     mongoose.connect('mongodb+srv://A01657055:A01657055@cluster0.7ixhp.mongodb.net/store?retryWrites=true&w=majority', {useUnifiedTopology: true, useNewUrlParser: true })
       .then(() => {
         console.log('Database connection successful')
       })
       .catch(err => {
         console.error('Database connection error')
       })
  }
}

module.exports = new Database(); // Also returns a singleton object as we only need a single connection to the DB