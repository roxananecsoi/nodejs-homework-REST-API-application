const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const phoneRegex =
  /^(\+?\d{1,3})?[-.\s]?(\(?\d{2,4}\)?[-.\s]?)?(\d{2,4}[-.\s]?\d{2,4}[-.\s]?\d{2,4})$/;

const contactSchema = new Schema({
  name: {
    type: String,
    minLength: 3,
    maxLength: 30,
    required: [true, "Set name for contact"],
  },
  email: {
    type: String,
    trim: true,
    unique: true,
    required: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Regex pentru validarea email-ului. Pentru validarea riguroasă a email-urilor, se poate utiliza o bibliotecă specializată.
  },
  phone: {
    type: String,
    validate: {
      validator: function (v) {
        return phoneRegex.test(v); // Validare număr de telefon flexibilă
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },
  favorite: {
    type: Boolean,
    default: false,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "user", // Referință la modelul 'User'
  },
});

const Contact = model("Contact", contactSchema);

module.exports = Contact;