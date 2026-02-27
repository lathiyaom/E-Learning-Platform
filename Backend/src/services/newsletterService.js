const { Newsletter } = require("../models");

const newsletterService = {
  async subscribe(email) {
    // ✅ Validate email
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new Error("Valid email is required");
    }

    // ✅ Check if already subscribed
    const existing = await Newsletter.findOne({ where: { email } });
    if (existing && existing.status === "subscribed") {
      throw new Error("Email already subscribed");
    }

    // ✅ Update or create
    if (existing) {
      await existing.update({ status: "subscribed" });
      return existing;
    }

    const subscriber = await Newsletter.create({
      email,
      status: "subscribed",
    });

    return subscriber;
  },

  async unsubscribe(email) {
    const subscriber = await Newsletter.findOne({ where: { email } });
    if (!subscriber) {
      throw new Error("Email not found");
    }

    await subscriber.update({ status: "unsubscribed" });
    return subscriber;
  },

  async getSubscriberCount() {
    const count = await Newsletter.count({
      where: { status: "subscribed" },
    });
    return count;
  },

  async getAllSubscribers() {
    return Newsletter.findAll({
      where: { status: "subscribed" },
      order: [["createdAt", "DESC"]],
    });
  },
};

module.exports = newsletterService;
