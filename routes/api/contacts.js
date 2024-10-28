require("../../passport.js");

const express = require("express");
const { STATUS_CODES } = require("../../utils/constants.js");
const AuthController = require("../../controllers/authController.js");
const { respondWithError } = require("../../utils/respondWithError.js");

const {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
  updateStatusContact,
} = require("../../controllers/contactsController.js");

const router = express.Router();

router.get("/", AuthController.validateAuth, async (req, res, next) => {
  const { page = 1, limit = 5, favorite } = req.query;

  try {
    const favoriteFilter =
      favorite !== undefined ? favorite === "true" : undefined;

    const contactsData = await listContacts(
      Number(page),
      Number(limit),
      favoriteFilter
    );
    res.status(STATUS_CODES.success).json({
      message: "The list was successfully returned",
      data: contactsData.contacts,
      totalContacts: contactsData.totalContacts,
      totalPages: contactsData.totalPages,
      currentPage: contactsData.currentPage,
    });
  } catch (error) {
    respondWithError(res, error);
  }
});

router.get(
  "/:contactId",
  AuthController.validateAuth,
  async (req, res, next) => {
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
  }
);

router.post("/", AuthController.validateAuth, async (req, res, next) => {
  const { name, email, phone } = req.body;
  try {
    const newContact = await addContact({ name, email, phone });
    res.status(STATUS_CODES.created).json(newContact);
  } catch (error) {
    respondWithError(res, error);
  }
});

router.delete(
  "/:contactId",
  AuthController.validateAuth,
  async (req, res, next) => {
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
  }
);

router.put(
  "/:contactId",
  AuthController.validateAuth,
  async (req, res, next) => {
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
  }
);

router.patch(
  "/:contactId/favorite",
  AuthController.validateAuth,
  async (req, res) => {
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
  }
);

module.exports = router;
