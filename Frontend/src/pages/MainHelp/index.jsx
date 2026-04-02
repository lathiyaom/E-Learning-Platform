import React, { useState, useMemo, useEffect } from "react";
import Layout from "../../components/Layout";
import HelpHero from "./components/HelpHero";
import HelpCategories from "./components/HelpCategories";
import HelpFAQ from "./components/HelpFAQ";
import HelpContactBanner from "./components/HelpContactBanner";

// ── Data ──────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    title: "Account Management",
    description: "Admin roles, security settings, and personal profile updates for your faculty.",
    iconKey: "user",
    color: "blue",
    keywords: ["account", "profile", "password", "security", "role", "admin", "login"],
  },
  {
    title: "Billing & Subscriptions",
    description: "Manage your institution's license plan, invoices, and payment methods.",
    iconKey: "creditCard",
    color: "emerald",
    keywords: ["billing", "payment", "invoice", "plan", "subscription", "price", "gateway"],
  },
  {
    title: "School Onboarding",
    description: "Step-by-step guides for setting up branches, terms, and initial curricula.",
    iconKey: "school",
    color: "amber",
    keywords: ["onboarding", "setup", "branch", "curricula", "term", "start", "sso", "bulk", "import"],
  },
  {
    title: "Technical Support",
    description: "API documentation, LMS integrations, and platform troubleshooting.",
    iconKey: "settings",
    color: "purple",
    keywords: ["technical", "api", "integration", "lms", "troubleshoot", "error", "export", "gradebook"],
  },
];

const FAQS = [
  {
    question: "How do I invite teachers to the platform?",
    answer:
      "Navigate to Staff Management in your Dashboard. You can send individual email invitations or use Bulk CSV Upload to onboard your entire faculty at once. Invited teachers receive a unique activation link.",
    tags: ["invite", "teacher", "staff", "csv", "bulk"],
  },
  {
    question: "Can I manage multiple school branches?",
    answer:
      "Yes. Our Advanced and Enterprise plans support multi-branch management from a single master dashboard. Each branch maintains its own student and staff records while sharing core institutional resources.",
    tags: ["branch", "manage", "multi", "school"],
  },
  {
    question: "What payment gateways are supported?",
    answer:
      "We support Stripe, PayPal, Razorpay, and direct bank transfers. All transactions are encrypted and compliant with international payment standards (PCI-DSS).",
    tags: ["payment", "gateway", "stripe", "paypal", "razorpay"],
  },
  {
    question: "Is student data compliant with privacy laws?",
    answer:
      "Absolutely. We are fully GDPR and CCPA compliant. Student data is encrypted at rest and in transit. We offer data residency options to meet local legal requirements.",
    tags: ["privacy", "gdpr", "ccpa", "student", "data", "compliance"],
  },
  {
    question: "How do I export student gradebooks?",
    answer:
      "In the Gradebook section, click Export and choose from CSV, PDF, or Excel formats to generate academic performance reports for individuals or entire classes.",
    tags: ["export", "gradebook", "csv", "pdf", "excel"],
  },
  {
    question: "How do I configure SSO for my institution?",
    answer:
      "Go to Settings → Security → SSO Configuration. We support SAML 2.0 and OAuth 2.0. Follow the step-by-step wizard to connect your identity provider (Google Workspace, Azure AD, Okta, etc.).",
    tags: ["sso", "saml", "oauth", "google", "azure", "configuration", "identity"],
  },
];

// ── Main Component ────────────────────────────────────────────────────────────
const MainHelp = () => {
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Filter categories by search query
  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return CATEGORIES;
    return CATEGORIES.filter(
      (cat) =>
        cat.title.toLowerCase().includes(q) ||
        cat.description.toLowerCase().includes(q) ||
        cat.keywords.some((k) => k.includes(q))
    );
  }, [searchQuery]);

  return (
    <Layout>
      {/* Hero with search */}
      <HelpHero searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Category grid — hides non-matching items on search */}
      <HelpCategories categories={filteredCategories} />

      {/* Section divider */}
      <div className="flex justify-center py-2">
        <span className="block w-20 h-0.5 bg-primary/20 dark:bg-premium-gold/20 rounded-full" />
      </div>

      {/* FAQ — filtered with live search */}
      <HelpFAQ faqs={FAQS} searchQuery={searchQuery} />

      {/* Still-need-help CTA banner */}
      <HelpContactBanner />
    </Layout>
  );
};

export default MainHelp;
