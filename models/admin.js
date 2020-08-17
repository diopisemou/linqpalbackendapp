// models/Admin.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');

// Define collection and schema
let Admin = new Schema({
    first_name: {
      type: String
    },
    last_name: {
      type: String
    },
    admin_email: {
      type: String
    },
    admin_password: {
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
    collection: 'admin'
  })

Admin.plugin(uniqueValidator, { message: 'Email already in use.' });
module.exports = mongoose.model('admin', Admin)





