const express = require("express");
const Joi = require("joi");

const nameExistence = Joi.object({
  name: Joi.string().required(),
});

const formatSchema = Joi.object({
  name: Joi.string().pattern(/^[a-zA-Z\s-]+$/),
  email: Joi.string().email({
    minDomainSegments: 2,
  }),
  phone: Joi.string().pattern(/^[0-9\s\-()+]+$/),
});

const {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
} = require("../../models/contacts.js");

const router = express.Router();

const STATUS_CODES = {
  success: 200,
  created: 201,
  deleted: 204,
  notFound: 404,
  badRequest: 400,
  error: 500,
};

const respondWithError = (res, error) => {
  console.error(error);
  res.status(STATUS_CODES.error).json({ message: `${error}` });
};

router.get("/", async (req, res, next) => {
  try {
    const contacts = await listContacts();
    res
      .status(STATUS_CODES.success)
      .json({ message: "The list was successfully returned", data: contacts });
  } catch (error) {
    respondWithError(res, error);
  }
});

router.get("/:contactId", async (req, res, next) => {
  try {
    const contact = await getContactById(req.params.contactId);
    console.log(req.params.contactId);

    if (!contact) {
      throw new Error("The contact was not found");
    }

    res.status(STATUS_CODES.success).json({
      message: "The contact has been returned successfully",
      data: contact,
    });
  } catch (error) {
    respondWithError(res, error);
  }
});

router.post("/", async (req, res, next) => {
  const { name, email, phone } = req.body;

  const { error: existenceError } = nameExistence.validate({ name });

  if (existenceError) {
    res
      .status(STATUS_CODES.badRequest)
      .json({ message: "Name field is required" });
    return;
  }

  const { error: formatError } = formatSchema.validate({ name, email, phone });

  if (formatError) {
    res
      .status(STATUS_CODES.badRequest)
      .json({ message: formatError.details[0].message });
    return;
  }

  try {
    const newContact = await addContact({ name, email, phone });
    res.status(STATUS_CODES.created).json(newContact);
  } catch (error) {
    respondWithError(res, error);
  }
});

router.delete("/:contactId", async (req, res, next) => {
  try {
    const contactId = req.params.contactId;
    const removedContact = await removeContact(contactId);

    if (!removedContact) {
      res
        .status(STATUS_CODES.notFound)
        .json({ message: "The contact was not found" });
      return;
    }

    res
      .status(STATUS_CODES.deleted)
      .json({ message: "Contact deleted successfully" });
  } catch (error) {
    respondWithError(res, error);
  }
});

router.put("/:contactId", async (req, res, next) => {
  const { name, email, phone } = req.body;
  const contactId = req.params.contactId;

  const { error: formatError } = formatSchema.validate({ name, email, phone });

  if (formatError) {
    res
      .status(STATUS_CODES.badRequest)
      .json({ message: formatError.details[0].message });
    return;
  }

  try {
    const updatedContact = await updateContact(req.body, contactId);

    if (!updatedContact) {
      res
        .status(STATUS_CODES.notFound)
        .json({ message: "The contact was not found" });
      return;
    }

    res.status(STATUS_CODES.success).json(updatedContact);
  } catch (error) {
    respondWithError(res, error);
  }
});

module.exports = router;
