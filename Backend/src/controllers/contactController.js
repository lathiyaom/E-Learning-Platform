const contactService = require("../services/contactService");

const CreateContact = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        message: "Request body is empty or not properly parsed",
        success: false,
      });
    }

    const newContact = await contactService.createContact(req.body);

    return res.status(201).json({
      message: "Contact message created successfully",
      success: true,
      contact: newContact,
    });
  } catch (error) {
    console.error("Error creating contact message:", error.message);
    return res
      .status(error.message === "You are not logged in" ? 401 : 400)
      .json({
        message: error.message || "Internal server error",
        success: false,
      });
  }
};

const GetComments = async (req, res) => {
  try {
    const contacts = await contactService.getAllContacts();

    if (!contacts || contacts.length === 0) {
      return res.status(404).json({
        message: "No comments found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "Comments retrieved successfully",
      success: true,
      contacts: contacts,
    });
  } catch (error) {
    console.error("Error retrieving comments:", error.message);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

const DeleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        message: "Contact ID is required",
        success: false,
      });
    }
    await contactService.deleteContact(id);
    return res.status(200).json({
      message: "Contact deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error deleting contact:", error.message);
    return res.status(error.message === "Contact not found" ? 404 : 400).json({
      message: error.message || "Internal server error",
      success: false,
    });
  }
};

module.exports = {
  CreateContact,
  GetComments,
  DeleteContact,
};
