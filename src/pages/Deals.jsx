
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Handshake,
  Plus,
  RefreshCw,
  Search,
  X,
  TrendingUp,
  CircleDollarSign,
  Trophy,
  XCircle,
  CalendarDays,
  UserRound,
  Pencil,
  Filter,
} from "lucide-react";
import { toast } from "react-toastify";

import api from "../api/axios";
import { useAuth } from "../context/useAuth";

const DEAL_STAGES = [
  "Inquiry",
  "Qualified",
  "Visit",
  "Offer",
  "Negotiation",
  "Booking",
  "Documentation",
  "Closed Won",
  "Closed Lost",
];

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStageStyle = (stage) => {
  const styles = {
    Inquiry: "bg-slate-100 text-slate-700",
    Qualified: "bg-blue-100 text-blue-700",
    Visit: "bg-purple-100 text-purple-700",
    Offer: "bg-amber-100 text-amber-700",
    Negotiation: "bg-orange-100 text-orange-700",
    Booking: "bg-indigo-100 text-indigo-700",
    Documentation: "bg-cyan-100 text-cyan-700",
    "Closed Won": "bg-green-100 text-green-700",
    "Closed Lost": "bg-red-100 text-red-700",
  };

  return styles[stage] || "bg-slate-100 text-slate-700";
};

function Deals() {
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === "admin";

  const [deals, setDeals] = useState([]);
  const [leads, setLeads] = useState([]);
  const [agents, setAgents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    leadId: "",
    agentId: "",
    amount: "",
    stage: "Inquiry",
    notes: "",
  });

  // Fetch deals from the backend.
  // IMPORTANT: This function is declared only once.
  const fetchDeals = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      }

      const response = await api.get("/deals");
      setDeals(response.data.deals || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load deals."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load deals when this page opens.
  // IMPORTANT: This is the only effect that fetches deals.
 useEffect(() => {
  let ignore = false;

  const loadDeals = async () => {
    try {
      setLoading(true);

      const response = await api.get("/deals");

      if (!ignore) {
        setDeals(response.data.deals || []);
      }
    } catch (error) {
      if (!ignore) {
        toast.error(
          error.response?.data?.message || "Failed to load deals"
        );
      }
    } finally {
      if (!ignore) {
        setLoading(false);
      }
    }
  };

  loadDeals();

  return () => {
    ignore = true;
  };
}, []);

  // Load leads and agents for the create-deal form.
  useEffect(() => {
    let ignore = false;

    const loadFormData = async () => {
      try {
        const requests = [
          api.get("/leads"),
          ...(isAdmin ? [api.get("/agents")] : []),
        ];

        const responses = await Promise.all(requests);

        if (ignore) return;

        setLeads(
          (responses[0].data.leads || []).filter(
            (lead) => lead.property
          )
        );

        if (isAdmin) {
          setAgents(
            (responses[1].data.agents || []).filter(
              (agent) =>
                agent.isActive !== false &&
                agent.status !== "Inactive"
            )
          );
        }
      } catch (error) {
        if (!ignore) {
          toast.error(
            error.response?.data?.message ||
              "Failed to load deal form data."
          );
        }
      }
    };

    loadFormData();

    return () => {
      ignore = true;
    };
  }, [isAdmin]);

  // Search and stage filtering.
  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      const searchText = [
        deal.lead?.name || "",
        deal.property?.title || "",
        deal.agent?.name || "",
        deal.property?.referenceCode || "",
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchText.includes(
        search.toLowerCase()
      );

      const matchesStage =
        stageFilter === "All" || deal.stage === stageFilter;

      return matchesSearch && matchesStage;
    });
  }, [deals, search, stageFilter]);

  // Dashboard statistics.
  const totalValue = deals.reduce(
    (total, deal) => total + (Number(deal.amount) || 0),
    0
  );

  const activeDeals = deals.filter(
    (deal) =>
      deal.stage !== "Closed Won" &&
      deal.stage !== "Closed Lost"
  );

  const closedWon = deals.filter(
    (deal) => deal.stage === "Closed Won"
  );

  const closedLost = deals.filter(
    (deal) => deal.stage === "Closed Lost"
  );

  // Open create form.
  const openCreateModal = () => {
    setEditingDeal(null);

    setForm({
      leadId: "",
      agentId: "",
      amount: "",
      stage: "Inquiry",
      notes: "",
    });

    setShowModal(true);
  };

  // Open edit form.
  const openEditModal = (deal) => {
    setEditingDeal(deal);

    setForm({
      leadId: deal.lead?._id || "",
      agentId: deal.agent?._id || "",
      amount: String(deal.amount ?? ""),
      stage: deal.stage || "Inquiry",
      notes: deal.notes || "",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (submitting) return;

    setShowModal(false);
    setEditingDeal(null);
  };

  // Select a lead and automatically fill its property price
  // and assigned agent, if available.
  const handleLeadChange = (leadId) => {
    const selectedLead = leads.find(
      (lead) => lead._id === leadId
    );

    setForm((previous) => ({
      ...previous,
      leadId,
      amount: selectedLead?.property?.price
        ? String(selectedLead.property.price)
        : previous.amount,
      agentId: isAdmin
        ? selectedLead?.assignedAgent?._id || ""
        : "",
    }));
  };

  // Create or update a deal.
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!editingDeal && !form.leadId) {
      toast.error("Please select a lead.");
      return;
    }

    if (
      form.amount === "" ||
      !Number.isFinite(Number(form.amount)) ||
      Number(form.amount) < 0
    ) {
      toast.error("Please enter a valid deal amount.");
      return;
    }

    if (isAdmin && !editingDeal && !form.agentId) {
      toast.error("Please select an agent.");
      return;
    }

    const payload = {
      amount: Number(form.amount),
      stage: form.stage,
      notes: form.notes,
    };

    if (!editingDeal) {
      payload.leadId = form.leadId;

      if (isAdmin) {
        payload.agentId = form.agentId;
      }
    }

    try {
      setSubmitting(true);

      if (editingDeal) {
        await api.patch(
          `/deals/${editingDeal._id}`,
          payload
        );

        toast.success("Deal updated successfully.");
      } else {
        await api.post("/deals", payload);
        toast.success("Deal created successfully.");
      }

      setShowModal(false);
      setEditingDeal(null);

      await fetchDeals();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-indigo-100 p-2.5 text-indigo-600">
              <Handshake size={22} />
            </div>

            <h1 className="text-2xl font-bold text-slate-800">
              Deals
            </h1>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Track sales opportunities and manage your property deals.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fetchDeals(true)}
            disabled={refreshing}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            <Plus size={17} />
            Create Deal
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Deals</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-800">
                {deals.length}
              </h2>
            </div>

            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <Handshake size={22} />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            All recorded deals
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Pipeline Value</p>
              <h2 className="mt-2 text-xl font-bold text-slate-800">
                {formatCurrency(totalValue)}
              </h2>
            </div>

            <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
              <CircleDollarSign size={22} />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Combined value of all deals
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Active Deals</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-800">
                {activeDeals.length}
              </h2>
            </div>

            <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
              <TrendingUp size={22} />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Deals still in progress
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Closed Won</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-800">
                {closedWon.length}
              </h2>
            </div>

            <div className="rounded-xl bg-green-50 p-3 text-green-600">
              <Trophy size={22} />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Successfully completed deals
          </p>
        </div>
      </div>

      {/* Deals Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-semibold text-slate-800">
              Sales Pipeline
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              View and manage your property deals.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search deals..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-400 sm:w-56"
              />
            </div>

            <div className="relative">
              <Filter
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={stageFilter}
                onChange={(event) =>
                  setStageFilter(event.target.value)
                }
                className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-8 text-sm outline-none focus:border-indigo-400 sm:w-48"
              >
                <option value="All">All Stages</option>
                {DEAL_STAGES.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw
              size={24}
              className="animate-spin text-indigo-600"
            />
            <span className="ml-3 text-sm text-slate-500">
              Loading deals...
            </span>
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
            <div className="rounded-2xl bg-slate-100 p-4 text-slate-400">
              <Handshake size={30} />
            </div>

            <h3 className="mt-4 font-semibold text-slate-700">
              No deals found
            </h3>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {deals.length === 0
                ? "Create your first deal using an existing lead."
                : "Try changing your search or stage filter."}
            </p>

            {deals.length === 0 && (
              <button
                type="button"
                onClick={openCreateModal}
                className="mt-4 cursor-pointer rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Create your first deal
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-225 text-left">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Customer</th>
                  <th className="px-5 py-4 font-semibold">Property</th>
                  <th className="px-5 py-4 font-semibold">Agent</th>
                  <th className="px-5 py-4 font-semibold">Amount</th>
                  <th className="px-5 py-4 font-semibold">Stage</th>
                  <th className="px-5 py-4 font-semibold">Created</th>
                  <th className="px-5 py-4 text-right font-semibold">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredDeals.map((deal) => (
                  <tr
                    key={deal._id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-600">
                          {deal.lead?.name?.charAt(0)?.toUpperCase() || "C"}
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {deal.lead?.name || "Unknown customer"}
                          </p>
                          <p className="text-xs text-slate-400">
                            {deal.lead?.email || "—"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-slate-700">
                        {deal.property?.title || "Property unavailable"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {deal.property?.referenceCode || "—"}
                        {deal.property?.city
                          ? ` · ${deal.property.city}`
                          : ""}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <UserRound size={15} className="text-slate-400" />
                        {deal.agent?.name || "—"}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-800">
                        {formatCurrency(deal.amount)}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStageStyle(deal.stage)}`}
                      >
                        {deal.stage}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <CalendarDays size={15} className="text-slate-400" />
                        {formatDate(deal.createdAt)}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => openEditModal(deal)}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredDeals.length > 0 && (
          <div className="border-t border-slate-100 px-5 py-4 text-xs text-slate-500">
            Showing {filteredDeals.length} of {deals.length} deals
          </div>
        )}
      </div>

      {/* Closed Deals Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-center justify-between rounded-2xl border border-green-100 bg-green-50/60 p-5">
          <div>
            <p className="text-sm font-medium text-green-700">
              Closed Won
            </p>
            <h3 className="mt-2 text-2xl font-bold text-green-800">
              {closedWon.length}
            </h3>
            <p className="mt-1 text-xs text-green-700">
              {formatCurrency(
                closedWon.reduce(
                  (total, deal) => total + Number(deal.amount || 0),
                  0
                )
              )}{" "}
              won value
            </p>
          </div>

          <Trophy size={28} className="text-green-600" />
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-red-100 bg-red-50/60 p-5">
          <div>
            <p className="text-sm font-medium text-red-700">
              Closed Lost
            </p>
            <h3 className="mt-2 text-2xl font-bold text-red-800">
              {closedLost.length}
            </h3>
            <p className="mt-1 text-xs text-red-700">
              Deals that were not completed
            </p>
          </div>

          <XCircle size={28} className="text-red-500" />
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4">
          <div className="my-6 w-full max-w-xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  {editingDeal ? "Edit Deal" : "Create New Deal"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {editingDeal
                    ? "Update the deal details and sales stage."
                    : "Create a deal from an existing customer lead."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {!editingDeal && (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Customer Lead *
                    </label>

                    <select
                      required
                      value={form.leadId}
                      onChange={(event) =>
                        handleLeadChange(event.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400"
                    >
                      <option value="">Select a customer lead</option>

                      {leads.map((lead) => (
                        <option key={lead._id} value={lead._id}>
                          {lead.name} — {lead.property?.title || "Property"}
                        </option>
                      ))}
                    </select>

                    {leads.length === 0 && (
                      <p className="mt-2 text-xs text-amber-600">
                        No eligible leads found. Create a lead linked to a property first.
                      </p>
                    )}
                  </div>

                  {isAdmin && (
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Assign Agent *
                      </label>

                      <select
                        required
                        value={form.agentId}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            agentId: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400"
                      >
                        <option value="">Select an agent</option>

                        {agents.map((agent) => (
                          <option key={agent._id} value={agent._id}>
                            {agent.name} — {agent.email}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Deal Amount (PKR) *
                </label>

                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={form.amount}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      amount: event.target.value,
                    }))
                  }
                  placeholder="Enter deal amount"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Deal Stage *
                </label>

                <select
                  required
                  value={form.stage}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      stage: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400"
                >
                  {DEAL_STAGES.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Notes
                </label>

                <textarea
                  rows="3"
                  value={form.notes}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      notes: event.target.value,
                    }))
                  }
                  placeholder="Add deal details or important information..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="cursor-pointer rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="cursor-pointer rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting
                    ? "Saving..."
                    : editingDeal
                      ? "Save Changes"
                      : "Create Deal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Deals;
