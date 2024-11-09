

const Contact = require("../models/contact.js");
const colors = require("colors");


const listContacts = async (page = 1, limit = 5, favorite) => {
  try {
    console.log(colors.bgYellow.italic.bold("--- List Contacts: ---"));

    const skip = (page - 1) * limit;
    const filter = favorite !== undefined ? { favorite } : {};

    const contacts = await Contact.find(filter).skip(skip).limit(limit);
    const totalContacts = await Contact.countDocuments(filter);

    return {
      contacts,
      totalContacts,
      totalPages: Math.ceil(totalContacts / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error(colors.bgRed.italic.bold(error));
    throw new Error(`Error listing contacts: ${error.message}`);
  }
};


const getContactById = async (contactId) => {
  try {
    console.log(
      colors.bgYellow.italic.bold(`--- List Contact with id ${contactId}: ---`)
    );
    return await Contact.findById(contactId);
  } catch (error) {
    console.error(colors.bgRed.italic.bold(error));
    throw new Error(`Error getting contact by id: ${error.message}`);
  }
};


const removeContact = async (contactId) => {
  try {
    console.log(
      colors.bgYellow.italic.bold(
        `--- Delete Contact with id ${contactId}: ---`
      )
    );
    return await Contact.findByIdAndDelete(contactId);
  } catch (error) {
    console.error(colors.bgRed.italic.bold(error));
    throw new Error(`Error removing contact: ${error.message}`);
  }
};

:
const addContact = async (contact) => {
  console.log(colors.bgYellow.italic.bold(`---  New Contact Created: ---`));
  try {
    return await Contact.create(contact);
  } catch (error) {
    console.error(colors.bgRed.italic.bold(error));
    throw new Error(`Error adding contact: ${error.message}`);
  }
};


const updateContact = async (updatedContact, contactId) => {
  console.log(
    colors.bgYellow.italic.bold(`--- Update Contact with id ${contactId}: ---`)
  );
  try {
    const updatedDoc = await Contact.findByIdAndUpdate(
      contactId,
      updatedContact,
      { new: true }
    );
    if (!updatedDoc) {
      throw new Error("The contact was not found.");
    }
    return updatedDoc;
  } catch (error) {
    console.error(colors.bgRed.italic.bold(error));
    throw new Error(`Error updating contact: ${error.message}`);
  }
};

const updateStatusContact = async (contactId, updatedStatus) => {
  console.log(
    colors.bgYellow.italic.bold(
      `--- Change Status for Contact with id ${contactId}: --- `
    )
  );
  try {
    const updatedDoc = await Contact.findByIdAndUpdate(
      contactId,
      updatedStatus,
      { new: true }
    );
    if (!updatedDoc) {
      throw new Error("The contact was not found.");
    }
    return updatedDoc;
  } catch (error) {
    console.error(colors.red(error));
    throw new Error(`Error updating contact status: ${error.message}`);
  }
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
};
