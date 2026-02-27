const newsletterService = require("../services/newsletterService");

const subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
        success: false,
      });
    }

    const subscriber = await newsletterService.subscribe(email);

    // Optional: Log for admin notification
    console.log(`New newsletter subscription from ${email}`);

    return res.status(201).json({
      message: "Successfully subscribed to newsletter",
      success: true,
      data: subscriber,
    });
  } catch (error) {
    console.error("Newsletter error:", error.message);
    const status = error.message.includes("already subscribed") ? 409 : 400;
    return res.status(status).json({
      message: error.message,
      success: false,
    });
  }
};

const unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
        success: false,
      });
    }

    await newsletterService.unsubscribe(email);

    return res.status(200).json({
      message: "Successfully unsubscribed",
      success: true,
    });
  } catch (error) {
    return res.status(404).json({
      message: error.message,
      success: false,
    });
  }
};

const getCount = async (req, res) => {
  try {
    const count = await newsletterService.getSubscriberCount();
    return res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  subscribe,
  unsubscribe,
  getCount,
};
