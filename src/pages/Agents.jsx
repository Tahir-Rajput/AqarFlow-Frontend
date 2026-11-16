
import { useCallback, useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  RefreshCw,
  Search,
  UserX,
  Mail,
  Phone,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "../api/axios";

function Agents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const fetchAgents = useCallback(async () => {
    try {
      const response = await api.get("/agents");
      setAgents(response.data.agents || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load agents."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
  let ignore = false;

  const loadAgents = async () => {
    try {
      const response = await api.get("/agents");

      if (!ignore) {
        setAgents(response.data.agents || []);
      }
    } catch (error) {
      if (!ignore) {
        toast.error(
          error.response?.data?.message ||
            "Failed to load agents."
        );
      }
    } finally {
      if (!ignore) {
        setLoading(false);
      }
    }
  };

  loadAgents();

  return () => {
    ignore = true;
  };
}, []);

  const handleRefresh = async () => {
    setLoading(true);
    await fetchAgents();
  };

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleCreateAgent = async (event) => {
    event.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      toast.error("Please complete all fields.");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must contain at least 8 characters.");
      return;
    }

    try {
      setSubmitting(true);

      await api.post("/agents", formData);

      toast.success("Agent created successfully.");

      setFormData({
        name: "",
        email: "",
        password: "",
      });

      setShowForm(false);
      await fetchAgents();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create agent."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (agentId) => {
    if (!window.confirm("Are you sure you want to deactivate this agent?")) {
      return;
    }

    try {
      await api.patch(`/agents/${agentId}/deactivate`);
      toast.success("Agent deactivated successfully.");
      await fetchAgents();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to deactivate agent."
      );
    }
  };

  const filteredAgents = agents.filter((agent) => {
    const searchValue = search.toLowerCase();

    return (
      agent.name?.toLowerCase().includes(searchValue) ||
      agent.email?.toLowerCase().includes(searchValue)
    );
  });

  const activeAgents = agents.filter((agent) => agent.isActive !== false).length;
  const inactiveAgents = agents.length - activeAgents;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your agency team and agent accounts.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            onClick={() => setShowForm(!showForm)}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <UserPlus size={17} />
            Add Agent
          </button>
        </div>
      </div>

      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Create New Agent
            </h2>

            <button
              onClick={() => setShowForm(false)}
              className="cursor-pointer rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleCreateAgent} className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter agent name"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="agent@example.com"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Temporary Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex gap-2 md:col-span-3">
              <button
                type="submit"
                disabled={submitting}
                className="cursor-pointer rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Creating..." : "Create Agent"}
              </button>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="cursor-pointer rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Total Agents</p>
            <Users className="text-blue-600" size={20} />
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">{agents.length}</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Active Agents</p>
          <p className="mt-3 text-2xl font-bold text-green-600">{activeAgents}</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Inactive Agents</p>
          <p className="mt-3 text-2xl font-bold text-red-600">{inactiveAgents}</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-gray-900">Agency Team</h2>
            <p className="mt-1 text-sm text-gray-500">
              View and manage your agents.
            </p>
          </div>

          <div className="relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search agents..."
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 sm:w-64"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-gray-500">
            Loading agents...
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="p-10 text-center">
            <Users className="mx-auto mb-3 text-gray-300" size={36} />
            <p className="font-medium text-gray-700">No agents found</p>
            <p className="mt-1 text-sm text-gray-500">
              Create an agent account to add someone to your team.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-162.5 text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-3">Agent</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredAgents.map((agent) => (
                  <tr key={agent._id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-900">{agent.name}</div>
                      <div className="text-xs text-gray-500">Agent</div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail size={14} />
                        {agent.email}
                      </div>
                      {agent.phone && (
                        <div className="mt-1 flex items-center gap-2 text-gray-500">
                          <Phone size={14} />
                          {agent.phone}
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          agent.isActive === false
                            ? "bg-red-50 text-red-700"
                            : "bg-green-50 text-green-700"
                        }`}
                      >
                        {agent.isActive === false ? "Inactive" : "Active"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      {agent.isActive !== false && (
                        <button
                          onClick={() => handleDeactivate(agent._id)}
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          <UserX size={14} />
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Agents;
