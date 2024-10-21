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
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  phone: {
    type: String,
    validate: {
      validator: function (v) {
        return phoneRegex.test(v);
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
    ref: "user",
  },
});

const Contact = model("Contact", contactSchema);

module.exports = Contact;
