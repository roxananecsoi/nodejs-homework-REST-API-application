const express = require("express");
const colors = require("colors");

const {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
  updateStatusContact,
} = require("../../controller/contactsController.js");

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
  console.error(colors.bgRed.italic.bold(error));
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
  const contactId = req.params.contactId;

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

router.patch("/:contactId/favorite", async (req, res) => {
  const contactId = req.params.contactId;
  const { favorite } = req.body;

  if (favorite === undefined) {
    return res
      .status(STATUS_CODES.badRequest)
      .json({ message: "missing field favorite" });
  }

  try {
    const updatedContact = await updateStatusContact(contactId, { favorite });
    if (!updatedContact) {
      return res.status(STATUS_CODES.notFound).json({ message: "Not found" });
    }
    res.status(STATUS_CODES.success).json(updatedContact);
  } catch (error) {
    respondWithError(res, error);
  }
});

module.exports = router;
