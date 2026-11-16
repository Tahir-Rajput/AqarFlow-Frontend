
import { useEffect, useState } from "react";
import { Save, UserRound, Building2, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import api from "../api/axios";
import { useAuth } from "../context/useAuth";

function Settings() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [savingAccount, setSavingAccount] = useState(false);
  const [savingAgency, setSavingAgency] = useState(false);

  const [account, setAccount] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
  });

  const [agency, setAgency] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
  });

  const isAdmin = user?.role === "admin";

  // Load account and agency settings
  useEffect(() => {
    let ignore = false;

    const loadSettings = async () => {
      try {
        const response = await api.get("/settings");

        if (ignore) return;

        const { user: userData, agency: agencyData } = response.data;

        setAccount({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          role: userData.role || "",
        });

        setAgency({
          name: agencyData.name || "",
          email: agencyData.email || "",
          phone: agencyData.phone || "",
          address: agencyData.address || "",
          city: agencyData.city || "",
        });
      } catch (error) {
        if (!ignore) {
          toast.error(
            error.response?.data?.message ||
              "Failed to load settings"
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      ignore = true;
    };
  }, []);

  // Handle account form changes
  const handleAccountChange = (e) => {
    const { name, value } = e.target;

    setAccount((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle agency form changes
  const handleAgencyChange = (e) => {
    const { name, value } = e.target;

    setAgency((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save account information
  const handleAccountSubmit = async (e) => {
    e.preventDefault();

    try {
      setSavingAccount(true);

      const response = await api.patch("/settings/account", {
        name: account.name,
        phone: account.phone,
      });

      setAccount((prev) => ({
        ...prev,
        name: response.data.user.name,
        phone: response.data.user.phone || "",
      }));

      toast.success(
        response.data.message || "Account updated successfully"
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update account"
      );
    } finally {
      setSavingAccount(false);
    }
  };

  // Save agency information
  const handleAgencySubmit = async (e) => {
    e.preventDefault();

    try {
      setSavingAgency(true);

      const response = await api.patch("/settings/agency", agency);

      const updatedAgency = response.data.agency;

      setAgency({
        name: updatedAgency.name || "",
        email: updatedAgency.email || "",
        phone: updatedAgency.phone || "",
        address: updatedAgency.address || "",
        city: updatedAgency.city || "",
      });

      toast.success(
        response.data.message || "Agency updated successfully"
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update agency"
      );
    } finally {
      setSavingAgency(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const labelClass =
    "mb-2 block text-sm font-medium text-gray-700";

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <RefreshCw className="animate-spin text-blue-600" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Settings
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage your agency account and application preferences.
        </p>
      </div>

      {/* Account settings */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
            <UserRound size={22} />
          </div>

          <div>
            <h2 className="font-semibold text-gray-900">
              Account Information
            </h2>
            <p className="text-sm text-gray-500">
              Manage your personal profile.
            </p>
          </div>
        </div>

        <form onSubmit={handleAccountSubmit}>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className={labelClass}>Full Name</label>
              <input
                type="text"
                name="name"
                value={account.name}
                onChange={handleAccountChange}
                className={inputClass}
                placeholder="Enter your name"
                required
              />
            </div>

            <div>
              <label className={labelClass}>Email Address</label>
              <input
                type="email"
                value={account.email}
                className={`${inputClass} cursor-not-allowed bg-gray-50`}
                disabled
              />
              <p className="mt-1 text-xs text-gray-400">
                Email cannot currently be changed.
              </p>
            </div>

            <div>
              <label className={labelClass}>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={account.phone}
                onChange={handleAccountChange}
                className={inputClass}
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className={labelClass}>Account Role</label>
              <input
                type="text"
                value={account.role}
                className={`${inputClass} cursor-not-allowed bg-gray-50 capitalize`}
                disabled
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={savingAccount}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={17} />
              {savingAccount ? "Saving..." : "Save Account"}
            </button>
          </div>
        </form>
      </section>

      {/* Agency settings */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-purple-50 p-3 text-purple-600">
            <Building2 size={22} />
          </div>

          <div>
            <h2 className="font-semibold text-gray-900">
              Agency Information
            </h2>
            <p className="text-sm text-gray-500">
              Manage your real estate agency details.
            </p>
          </div>
        </div>

        <form onSubmit={handleAgencySubmit}>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className={labelClass}>Agency Name</label>
              <input
                type="text"
                name="name"
                value={agency.name}
                onChange={handleAgencyChange}
                className={inputClass}
                placeholder="Agency name"
                disabled={!isAdmin}
                required
              />
            </div>

            <div>
              <label className={labelClass}>Agency Email</label>
              <input
                type="email"
                name="email"
                value={agency.email}
                onChange={handleAgencyChange}
                className={inputClass}
                placeholder="Agency email"
                disabled={!isAdmin}
              />
            </div>

            <div>
              <label className={labelClass}>Agency Phone</label>
              <input
                type="tel"
                name="phone"
                value={agency.phone}
                onChange={handleAgencyChange}
                className={inputClass}
                placeholder="Agency phone"
                disabled={!isAdmin}
              />
            </div>

            <div>
              <label className={labelClass}>City</label>
              <input
                type="text"
                name="city"
                value={agency.city}
                onChange={handleAgencyChange}
                className={inputClass}
                placeholder="City"
                disabled={!isAdmin}
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Agency Address</label>
              <input
                type="text"
                name="address"
                value={agency.address}
                onChange={handleAgencyChange}
                className={inputClass}
                placeholder="Complete agency address"
                disabled={!isAdmin}
              />
            </div>
          </div>

          {isAdmin ? (
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={savingAgency}
                className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={17} />
                {savingAgency ? "Saving..." : "Save Agency"}
              </button>
            </div>
          ) : (
            <p className="mt-5 text-sm text-gray-500">
              Only agency administrators can edit agency information.
            </p>
          )}
        </form>
      </section>
    </div>
  );
}

export default Settings;
