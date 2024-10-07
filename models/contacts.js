const fs = require("fs/promises");
const { v4: uuidv4 } = require("uuid");

const CONTACTS_FILE_PATH = "./models/contacts.json";

const saveContactsToFile = async (contactsData) => {
  try {
    await fs.writeFile(
      CONTACTS_FILE_PATH,
      JSON.stringify(contactsData, null, 2)
    );
    console.log("Contacts saved successfully!");
  } catch (error) {
    console.error("Error saving contacts:", error);
    throw new Error("Failed to save contacts");
  }
};

const readContactsFromFile = async () => {
  try {
    const contactsJSON = await fs.readFile(CONTACTS_FILE_PATH);
    return JSON.parse(contactsJSON);
  } catch (error) {
    console.error("Error reading contacts:", error);
    throw new Error("Failed to read contacts");
  }
};

const listContacts = async () => {
  return await readContactsFromFile();
};

const getContactById = async (contactId) => {
  const contacts = await readContactsFromFile();
  return contacts.find((element) => element.id === contactId);
};

const removeContact = async (contactId) => {
  const contacts = await readContactsFromFile();
  const updatedContacts = contacts.filter(
    (element) => element.id !== contactId
  );
  await saveContactsToFile(updatedContacts);
  console.log(`Contact with id: ${contactId} removed successfully!`);
  return updatedContacts;
};

const addContact = async (body) => {
  try {
    const contacts = await readContactsFromFile();
    const preparedContact = {
      id: uuidv4(),
      ...body,
    };
    contacts.push(preparedContact);
    await saveContactsToFile(contacts);
    console.log("Contact added successfully!");
  } catch (error) {
    throw new Error(`Error adding contact: ${error.message}`);
  }
};

const updateContact = async (updatedContact, contactId) => {
  try {
    const contacts = await readContactsFromFile();
    const index = contacts.findIndex((contact) => contact.id === contactId);
    if (index === -1) {
      throw new Error("The contact was not found.");
    }
    const updatedFields = { ...contacts[index], ...updatedContact };
    contacts[index] = { ...updatedFields, id: contactId };
    await saveContactsToFile(contacts);
    return contacts[index];
  } catch (error) {
    throw new Error(`Error updating contact: ${error.message}`);
  }
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
