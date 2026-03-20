import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Building2, Mail, Phone, UserRound, Sparkles, ShieldCheck, Save } from "lucide-react";
import AdminLayout from "../../../utils/Adminlayoute";
import { getBreadcrumbs } from "../../../utils/breadcrumbs";
import { ErrorToster, SuccessToster } from "../../../components/toster";
import { getSettings, updateSettings } from "../../../redux/Apis/profileApi";

const initialForm = {
  organizationName: "",
  organizationEmail: "",
  organizationPhone: "",
  ownerName: "",
  ownerEmail: "",
  ownerPhone: "",
  organizationAbout: "",
};

const normalizeFormData = (data = {}) => ({
  organizationName: data.organizationName || "",
  organizationEmail: data.organizationEmail || "",
  organizationPhone: data.organizationPhone || "",
  ownerName: data.ownerName || "",
  ownerEmail: data.ownerEmail || "",
  ownerPhone: data.ownerPhone || "",
  organizationAbout: data.organizationAbout || "",
});

function AdminSetting() {
  const dispatch = useDispatch();
  const breadcrumbItems = getBreadcrumbs("SETTINGS");
  const { settings } = useSelector((state) => state.profile);

  const [formState, setFormState] = React.useState(initialForm);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [errors, setErrors] = React.useState({});

  React.useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const response = await dispatch(getSettings()).unwrap();
        setFormState(normalizeFormData(response));
      } catch (error) {
        ErrorToster(error || "Failed to load organization settings", 3000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [dispatch]);

  React.useEffect(() => {
    if (settings) {
      setFormState(normalizeFormData(settings));
    }
  }, [settings]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormState((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!formState.organizationName.trim()) {
      nextErrors.organizationName = "Organization name is required";
    }

    if (!formState.organizationEmail.trim()) {
      nextErrors.organizationEmail = "Organization email is required";
    }

    if (!formState.organizationPhone.trim()) {
      nextErrors.organizationPhone = "Organization phone is required";
    }

    if (!formState.ownerName.trim()) {
      nextErrors.ownerName = "Owner name is required";
    }

    if (!formState.ownerEmail.trim()) {
      nextErrors.ownerEmail = "Owner email is required";
    }

    if (!formState.ownerPhone.trim()) {
      nextErrors.ownerPhone = "Owner phone is required";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      const payload = {
        organizationName: formState.organizationName.trim(),
        organizationEmail: formState.organizationEmail.trim(),
        organizationPhone: formState.organizationPhone.trim(),
        ownerName: formState.ownerName.trim(),
        ownerEmail: formState.ownerEmail.trim(),
        ownerPhone: formState.ownerPhone.trim(),
        organizationAbout: formState.organizationAbout.trim(),
      };

      const updated = await dispatch(updateSettings(payload)).unwrap();
      setFormState(normalizeFormData(updated));
      SuccessToster("Organization settings updated successfully", 2200);
    } catch (error) {
      ErrorToster(error || "Failed to update organization settings", 3200);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout showSearch={false} className="p-0" breadcrumbItems={breadcrumbItems}>
      <div className="min-h-[calc(100vh-96px)] bg-gradient-to-br from-lavender-light via-background-light to-white dark:from-navy-charcoal dark:to-deep-charcoal p-4 md:p-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 rounded-3xl border border-card-border bg-white/80 p-6 shadow-gold backdrop-blur-xl dark:border-premium-border dark:bg-premium-surface/80">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-lavender px-3 py-1 text-xs font-semibold uppercase tracking-wide text-studprimary dark:bg-premium-gold/20 dark:text-premium-gold">
                  <Sparkles size={14} />
                  Organization Control Center
                </p>
                <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-900 dark:text-white md:text-3xl">
                  Admin Settings
                </h1>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Manage your institution identity, contact details, and owner profile in one place.
                </p>
              </div>
              <div className="rounded-2xl border border-premium-border bg-lavender-light px-4 py-3 text-sm font-medium text-tan-gold dark:bg-premium-surface-2 dark:text-premium-gold">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} />
                  Securely scoped to your organization
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <section className="lg:col-span-2 rounded-3xl border border-card-border bg-white/90 p-6 shadow-gold backdrop-blur dark:border-premium-border dark:bg-premium-surface/85">
              <h2 className="mb-5 text-lg font-bold text-slate-900 dark:text-white">Organization Profile</h2>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <InputField
                  icon={Building2}
                  label="Organization Name"
                  value={formState.organizationName}
                  onChange={handleChange("organizationName")}
                  error={errors.organizationName}
                  placeholder="Eduverse Academy"
                  disabled={isLoading || isSaving}
                />

                <InputField
                  icon={Mail}
                  label="Organization Email"
                  type="email"
                  value={formState.organizationEmail}
                  onChange={handleChange("organizationEmail")}
                  error={errors.organizationEmail}
                  placeholder="contact@organization.com"
                  disabled={isLoading || isSaving}
                />

                <InputField
                  icon={Phone}
                  label="Organization Phone"
                  value={formState.organizationPhone}
                  onChange={handleChange("organizationPhone")}
                  error={errors.organizationPhone}
                  placeholder="+91 9876543210"
                  disabled={isLoading || isSaving}
                />

              </div>

              <div className="mt-6">
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  About Organization
                </label>
                <textarea
                  rows={5}
                  value={formState.organizationAbout}
                  onChange={handleChange("organizationAbout")}
                  placeholder="Write a short identity statement for your institution"
                  className="w-full rounded-2xl border border-slate-300 bg-white/90 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-studprimary focus:ring-4 focus:ring-lavender disabled:cursor-not-allowed disabled:opacity-60 dark:border-premium-border dark:bg-deep-charcoal dark:text-slate-200 dark:focus:border-premium-gold dark:focus:ring-gold-glow"
                  disabled={isLoading || isSaving}
                />
              </div>
            </section>

            <section className="rounded-3xl border border-card-border bg-white/90 p-6 shadow-gold backdrop-blur dark:border-premium-border dark:bg-premium-surface/85">
              <h2 className="mb-5 text-lg font-bold text-slate-900 dark:text-white">Owner Profile</h2>
              <div className="space-y-5">
                <InputField
                  icon={UserRound}
                  label="Owner Name"
                  value={formState.ownerName}
                  onChange={handleChange("ownerName")}
                  error={errors.ownerName}
                  placeholder="Organization owner"
                  disabled={isLoading || isSaving}
                />

                <InputField
                  icon={Mail}
                  label="Owner Email"
                  type="email"
                  value={formState.ownerEmail}
                  onChange={handleChange("ownerEmail")}
                  error={errors.ownerEmail}
                  placeholder="owner@organization.com"
                  disabled={isLoading || isSaving}
                />

                <InputField
                  icon={Phone}
                  label="Owner Phone"
                  value={formState.ownerPhone}
                  onChange={handleChange("ownerPhone")}
                  error={errors.ownerPhone}
                  placeholder="Owner direct phone"
                  disabled={isLoading || isSaving}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || isSaving}
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-studprimary to-tan-gold px-4 py-3 text-sm font-bold text-white shadow-gold transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Save size={16} />
                {isSaving ? "Saving Changes..." : "Save Settings"}
              </button>

              {isLoading ? (
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Loading organization settings...</p>
              ) : (
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Changes are applied only to your current organization account.</p>
              )}
            </section>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}

function InputField({
  icon: Icon,
  label,
  error,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <Icon size={16} />
        </span>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full rounded-2xl border bg-white/90 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-950 dark:text-slate-200 ${
            error
              ? "border-rose-400 focus:border-rose-400 focus:ring-rose-100 dark:focus:ring-rose-900/40"
              : "border-slate-300 focus:border-studprimary focus:ring-lavender dark:border-premium-border dark:bg-deep-charcoal dark:focus:border-premium-gold dark:focus:ring-gold-glow"
          }`}
        />
      </div>
      {error ? <p className="mt-1 text-xs text-rose-500">{error}</p> : null}
    </label>
  );
}

export default AdminSetting;