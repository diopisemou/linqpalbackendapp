const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define collection and schema
let User = new Schema({
  first_name: {
    type: String
  },
  last_name: {
    type: String
  },
  user_email: {
    type: String
  },
  fulladdress: {
    type: String
  },
  ssn: {
    type: String
  },
  dob: {
    type: Date
  },
  gender: {
    type: String
  }
}, {
  collection: 'user'
})
// First Name, Last Name, Telephone Number, Full Address, and SSN.
module.exports = mongoose.model('user', User)