const { ContactUs, User } = require("../models");
const validators = require("../utils/validators");

const createContact = async (contactData) => {
  const { fullname, email, phone, subject, message } = contactData;

  // ✅ Validate all required fields
  if (!fullname || !email || !phone || !subject || !message) {
    throw new Error("All fields are required");
  }

  // ✅ Validate email format
  const emailValidation = validators.validateEmail(email);
  if (!emailValidation.valid) throw new Error(emailValidation.error);

  // ✅ Validate phone format
  const phoneValidation = validators.validatePhone(phone);
  if (!phoneValidation.valid) throw new Error(phoneValidation.error);

  // ✅ Validate message length
  const messageValidation = validators.validateTextLength(message, 10, 5000, "Message");
  if (!messageValidation.valid) throw new Error(messageValidation.error);

  // ✅ Optional: Link to user if exists (don't require it)
  let userId = null;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    userId = existingUser._id;
  }

  // ✅ Create contact regardless of user existence (Mongoose)
  const newContact = await ContactUs.create({
    fullname,
    email,
    phone,
    subject,
    message,
    userId,
  });

  return newContact;
};

const getAllContacts = async () => {
  const contacts = await ContactUs.find().sort({ createdAt: -1 });
  return contacts;
};

const deleteContact = async (id) => {
  const contact = await ContactUs.findByIdAndDelete(id);
  if (!contact) throw new Error("Contact not found");
  return contact;
};

module.exports = {
  createContact,
  getAllContacts,
  deleteContact,
};
