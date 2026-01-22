const mongoose = require('mongoose');
const { parsePhoneNumberFromString } = require('libphonenumber-js');

const defaultCountry = process.env.DEFAULT_COUNTRY || undefined;

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    validate: {
      validator: v => !/\d/.test(v),
      message: 'Name must not contain numbers'
    }
  },
  age: Number,
  department: String,
  email: String,
  phone: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true; // allow empty phone; change to false to require phone
        const pn = parsePhoneNumberFromString(v, defaultCountry);
        // isPossible enforces length limits for country; isValid checks full validity
        return !!pn && pn.isPossible() && pn.isValid();
      },
      message: props => `${props.value} is not a valid phone number for the configured country`
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
