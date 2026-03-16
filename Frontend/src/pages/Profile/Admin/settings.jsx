import React from "react";
import { useDispatch, useSelector } from "react-redux";
import AdminLayout from "../../../utils/Adminlayoute";
import { getBreadcrumbs } from "../../../utils/breadcrumbs";
import { getSettings, updateSettings } from "../../../redux/Apis/profileApi";
import { ErrorToster, SuccessToster } from "../../../components/toster";

function Settings() {
  const breadcrumbItems = getBreadcrumbs("SETTINGS");
  const dispatch = useDispatch();
  const { settings, loading } = useSelector((state) => state.profile);

  const [formState, setFormState] = React.useState({
    adminName: "",
    adminPhone: "",
    adminBio: "",
    organizationName: "",
    organizationEmail: "",
    organizationPhone: "",
    emailNotifications: true,
    eventReminders: true,
    holidayAlerts: true,
    digestFrequency: "weekly",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  React.useEffect(() => {
    dispatch(getSettings());
  }, [dispatch]);

  React.useEffect(() => {
    if (settings) {
      setFormState((prev) => ({ ...prev, ...settings }));
    }
  }, [settings]);

  const handleToggle = (field) => {
    setFormState((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = async () => {
    if (formState.newPassword && formState.newPassword !== formState.confirmPassword) {
      ErrorToster("New password and confirm password do not match", 3000);
      return;
    }

    const payload = {
      ...formState,
      currentPassword: undefined,
      newPassword: undefined,
      confirmPassword: undefined,
    };

    try {
      await dispatch(updateSettings(payload)).unwrap();
      SuccessToster("Settings updated", 2000);
    } catch (error) {
      ErrorToster(error || "Failed to update settings", 3000);
    }
  };

  return (
    <AdminLayout showSearch={false} className="p-0" breadcrumbItems={breadcrumbItems}>
      <div className="p-6 md:p-8">
        <div className="max-w-4xl bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 p-6 space-y-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Settings</h1>

          {loading && <p className="text-sm text-slate-500">Loading settings...</p>}

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Profile Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-slate-700 dark:text-slate-300 mb-2">Admin name</span>
                <input
                  type="text"
                  value={formState.adminName || ""}
                  onChange={(e) => setFormState((prev) => ({ ...prev, adminName: e.target.value }))}
                  className="w-full border border-slate-300 dark:border-white/20 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 dark:text-white"
                />
              </label>

              <label className="block">
                <span className="block text-slate-700 dark:text-slate-300 mb-2">Admin phone</span>
                <input
                  type="text"
                  value={formState.adminPhone || ""}
                  onChange={(e) => setFormState((prev) => ({ ...prev, adminPhone: e.target.value }))}
                  className="w-full border border-slate-300 dark:border-white/20 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 dark:text-white"
                />
              </label>
            </div>

            <label className="block">
              <span className="block text-slate-700 dark:text-slate-300 mb-2">Bio</span>
              <textarea
                rows={3}
                value={formState.adminBio || ""}
                onChange={(e) => setFormState((prev) => ({ ...prev, adminBio: e.target.value }))}
                className="w-full border border-slate-300 dark:border-white/20 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 dark:text-white"
              />
            </label>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Organization Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-slate-700 dark:text-slate-300 mb-2">Organization name</span>
                <input
                  type="text"
                  value={formState.organizationName || ""}
                  onChange={(e) => setFormState((prev) => ({ ...prev, organizationName: e.target.value }))}
                  className="w-full border border-slate-300 dark:border-white/20 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 dark:text-white"
                />
              </label>

              <label className="block">
                <span className="block text-slate-700 dark:text-slate-300 mb-2">Organization email</span>
                <input
                  type="email"
                  value={formState.organizationEmail || ""}
                  onChange={(e) => setFormState((prev) => ({ ...prev, organizationEmail: e.target.value }))}
                  className="w-full border border-slate-300 dark:border-white/20 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 dark:text-white"
                />
              </label>
            </div>

            <label className="block">
              <span className="block text-slate-700 dark:text-slate-300 mb-2">Organization phone</span>
              <input
                type="text"
                value={formState.organizationPhone || ""}
                onChange={(e) => setFormState((prev) => ({ ...prev, organizationPhone: e.target.value }))}
                className="w-full border border-slate-300 dark:border-white/20 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 dark:text-white"
              />
            </label>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Notification Settings</h2>
            <label className="flex items-center justify-between">
              <span className="text-slate-700 dark:text-slate-300">Email notifications</span>
              <input
                type="checkbox"
                checked={Boolean(formState.emailNotifications)}
                onChange={() => handleToggle("emailNotifications")}
              />
            </label>

            <label className="flex items-center justify-between">
              <span className="text-slate-700 dark:text-slate-300">Event reminders</span>
              <input
                type="checkbox"
                checked={Boolean(formState.eventReminders)}
                onChange={() => handleToggle("eventReminders")}
              />
            </label>

            <label className="flex items-center justify-between">
              <span className="text-slate-700 dark:text-slate-300">Holiday alerts</span>
              <input
                type="checkbox"
                checked={Boolean(formState.holidayAlerts)}
                onChange={() => handleToggle("holidayAlerts")}
              />
            </label>

            <label className="block">
              <span className="block text-slate-700 dark:text-slate-300 mb-2">Digest frequency</span>
              <select
                value={formState.digestFrequency || "weekly"}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, digestFrequency: e.target.value }))
                }
                className="w-full border border-slate-300 dark:border-white/20 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 dark:text-white"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </label>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Security</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="block">
                <span className="block text-slate-700 dark:text-slate-300 mb-2">Current password</span>
                <input
                  type="password"
                  value={formState.currentPassword || ""}
                  onChange={(e) => setFormState((prev) => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full border border-slate-300 dark:border-white/20 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 dark:text-white"
                />
              </label>
              <label className="block">
                <span className="block text-slate-700 dark:text-slate-300 mb-2">New password</span>
                <input
                  type="password"
                  value={formState.newPassword || ""}
                  onChange={(e) => setFormState((prev) => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full border border-slate-300 dark:border-white/20 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 dark:text-white"
                />
              </label>
              <label className="block">
                <span className="block text-slate-700 dark:text-slate-300 mb-2">Confirm password</span>
                <input
                  type="password"
                  value={formState.confirmPassword || ""}
                  onChange={(e) => setFormState((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full border border-slate-300 dark:border-white/20 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 dark:text-white"
                />
              </label>
            </div>
          </section>

          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-studprimary text-white font-semibold hover:brightness-110"
          >
            Save Settings
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}

export default Settings;
