
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  MapPin,
  RefreshCw,
  Search,
  UserRound,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  ClipboardList,
  Phone,
  Mail,
  Save,
} from "lucide-react";
import { toast } from "react-toastify";

import api from "../api/axios";
import { useAuth } from "../context/useAuth";

const visitStatuses = [
  "Requested",
  "Confirmed",
  "Completed",
  "Cancelled",
  "No-show",
];

const statusStyles = {
  Requested: "bg-amber-50 text-amber-700",
  Confirmed: "bg-blue-50 text-blue-700",
  Completed: "bg-emerald-50 text-emerald-700",
  Cancelled: "bg-red-50 text-red-700",
  "No-show": "bg-slate-100 text-slate-600",
};

function formatDate(date) {
  if (!date) return "Date unavailable";

  return new Date(date).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(date) {
  if (!date) return "";

  return new Date(date).toLocaleTimeString("en-PK", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getLocalDateTime() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

  return date.toISOString().slice(0, 16);
}

function Visits() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [visits, setVisits] = useState([]);
  const [leads, setLeads] = useState([]);
  const [agents, setAgents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [leadId, setLeadId] = useState("");
  const [agentId, setAgentId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const [notesDrafts, setNotesDrafts] = useState({});
  const [savingNotes, setSavingNotes] = useState("");

  const fetchVisits = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await api.get("/visits");
      setVisits(response.data.visits || []);
    } catch (error) {
      console.error("Fetch visits error:", error);
      toast.error(
        error.response?.data?.message || "Failed to load visits."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadFormData = async () => {
      try {
        const [leadsResponse, agentsResponse] = await Promise.all([
          api.get("/leads"),
          isAdmin ? api.get("/agents") : Promise.resolve(null),
        ]);

        if (ignore) return;

        setLeads(leadsResponse.data.leads || []);

        if (agentsResponse) {
          const activeAgents = (agentsResponse.data.agents || []).filter(
            (agent) => agent.role === "agent" && agent.isActive !== false
          );

          setAgents(activeAgents);
        }
      } catch (error) {
        if (!ignore) {
          console.error("Load scheduling data error:", error);
          toast.error(
            error.response?.data?.message ||
              "Could not load leads or agents for scheduling."
          );
        }
      }
    };

    loadFormData();

    return () => {
      ignore = true;
    };
  }, [isAdmin]);

  useEffect(() => {
  let ignore = false;

  const loadVisits = async () => {
    try {
      const response = await api.get("/visits");

      if (!ignore) {
        setVisits(response.data.visits || []);
      }
    } catch (error) {
      if (!ignore) {
        console.error("Fetch visits error:", error);
        toast.error(
          error.response?.data?.message || "Failed to load visits."
        );
      }
    } finally {
      if (!ignore) {
        setLoading(false);
      }
    }
  };

  loadVisits();

  return () => {
    ignore = true;
  };
}, []);

  const selectedLead = leads.find((lead) => lead._id === leadId);

  const availableAgents = useMemo(() => {
    if (!selectedLead?.assignedAgent) {
      return agents;
    }

    const assignedId =
      selectedLead.assignedAgent._id || selectedLead.assignedAgent;

    return agents.filter((agent) => agent._id === assignedId);
  }, [agents, selectedLead]);

  const filteredVisits = useMemo(() => {
    return visits.filter((visit) => {
      const customerName = visit.lead?.name || "";
      const propertyName = visit.property?.title || "";
      const agentName = visit.agent?.name || "";
      const referenceCode = visit.property?.referenceCode || "";

      const searchText = [
        customerName,
        propertyName,
        agentName,
        referenceCode,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || visit.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [visits, search, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: visits.length,
      requested: visits.filter((visit) => visit.status === "Requested").length,
      confirmed: visits.filter((visit) => visit.status === "Confirmed").length,
      completed: visits.filter((visit) => visit.status === "Completed").length,
    };
  }, [visits]);

  const resetForm = () => {
    setLeadId("");
    setAgentId("");
    setScheduledAt("");
    setNewNotes("");
  };

  const openScheduleModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleLeadChange = (value) => {
    setLeadId(value);

    const lead = leads.find((item) => item._id === value);

    if (isAdmin && lead?.assignedAgent) {
      setAgentId(lead.assignedAgent._id || lead.assignedAgent);
    } else if (isAdmin) {
      setAgentId("");
    }
  };

  const handleScheduleVisit = async (event) => {
    event.preventDefault();

    if (!leadId || !scheduledAt) {
      toast.error("Please select a lead and appointment date/time.");
      return;
    }

    const appointmentDate = new Date(scheduledAt);

    if (
      Number.isNaN(appointmentDate.getTime()) ||
      appointmentDate <= new Date()
    ) {
      toast.error("Please select a future appointment date and time.");
      return;
    }

    if (isAdmin && !agentId) {
      toast.error("Please select an agent.");
      return;
    }

    const payload = {
      leadId,
      scheduledAt: appointmentDate.toISOString(),
      notes: newNotes.trim(),
    };

    if (isAdmin) {
      payload.agentId = agentId;
    }

    try {
      setSubmitting(true);

      const response = await api.post("/visits", payload);

      toast.success(
        response.data.message || "Visit scheduled successfully."
      );

      setShowModal(false);
      resetForm();

      await fetchVisits(true);
    } catch (error) {
      console.error("Schedule visit error:", error);

      toast.error(
        error.response?.data?.message || "Failed to schedule visit."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (visitId, status) => {
    try {
      const response = await api.patch(`/visits/${visitId}`, {
        status,
      });

      setVisits((currentVisits) =>
        currentVisits.map((visit) =>
          visit._id === visitId ? response.data.visit : visit
        )
      );

      toast.success("Visit status updated.");
    } catch (error) {
      console.error("Update visit status error:", error);

      toast.error(
        error.response?.data?.message || "Failed to update visit status."
      );
    }
  };
  
const handleSaveNotes = async (visitId) => {
  const notes = notesDrafts[visitId] ?? "";

  try {
    setSavingNotes(visitId);

    const response = await api.patch(`/visits/${visitId}`, {
      notes,
    });

    const updatedVisit = response.data.visit;

    setVisits((currentVisits) =>
      currentVisits.map((visit) =>
        visit._id === visitId ? updatedVisit : visit
      )
    );

    // Clear the old draft so the textarea displays saved server data.
    setNotesDrafts((current) => {
      const updated = { ...current };
      delete updated[visitId];
      return updated;
    });

    toast.success("Visit notes saved.");
  } catch (error) {
    console.error("Save visit notes error:", error);

    toast.error(
      error.response?.data?.message || "Failed to save visit notes."
    );
  } finally {
    setSavingNotes("");
  }
};

  return (
    <div className="space-y-7">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-1 text-sm font-medium text-blue-600">
            Appointment management
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Property Visits
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Schedule appointments and track customer property visits.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fetchVisits(true)}
            disabled={refreshing}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={openScheduleModal}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Schedule Visit
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total Visits",
            value: stats.total,
            icon: ClipboardList,
            color: "bg-blue-50 text-blue-600",
          },
          {
            label: "Requested",
            value: stats.requested,
            icon: AlertCircle,
            color: "bg-amber-50 text-amber-600",
          },
          {
            label: "Confirmed",
            value: stats.confirmed,
            icon: CalendarDays,
            color: "bg-violet-50 text-violet-600",
          },
          {
            label: "Completed",
            value: stats.completed,
            icon: CheckCircle2,
            color: "bg-emerald-50 text-emerald-600",
          },
        ].map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  {stat.label}
                </p>

                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.color}`}
                >
                  <Icon size={21} />
                </div>
              </div>

              <h3 className="mt-4 text-3xl font-bold text-slate-900">
                {loading ? "..." : stat.value}
              </h3>
            </div>
          );
        })}
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between md:px-6">
          <div>
            <h2 className="font-bold text-slate-900">
              Visit Schedule
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              View and manage your property appointments.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5">
              <Search size={17} className="text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search visits..."
                className="w-full text-sm outline-none placeholder:text-slate-400 sm:w-48"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-blue-400"
            >
              <option value="All">All statuses</option>
              {visitStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-slate-500">
            Loading visits...
          </div>
        ) : filteredVisits.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <CalendarDays size={26} />
            </div>

            <h3 className="font-semibold text-slate-800">
              {visits.length === 0
                ? "No visits scheduled yet"
                : "No matching visits"}
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              {visits.length === 0
                ? "Schedule a property visit to see it here."
                : "Try changing your search or status filter."}
            </p>

            {visits.length === 0 && (
              <button
                type="button"
                onClick={openScheduleModal}
                className="mt-5 cursor-pointer rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Schedule your first visit
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredVisits.map((visit) => (
              <article key={visit._id} className="p-5 md:p-6">
                <div className="flex flex-col justify-between gap-4 lg:flex-row">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-slate-900">
                        {visit.lead?.name || "Unknown customer"}
                      </h3>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          statusStyles[visit.status] ||
                          "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {visit.status}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <CalendarDays size={16} className="shrink-0 text-blue-500" />
                        {formatDate(visit.scheduledAt)}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Clock3 size={16} className="shrink-0 text-blue-500" />
                        {formatTime(visit.scheduledAt)}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <MapPin size={16} className="shrink-0 text-blue-500" />
                        <span className="truncate">
                          {visit.property?.title || "Property unavailable"}
                          {visit.property?.referenceCode
                            ? ` (${visit.property.referenceCode})`
                            : ""}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <UserRound size={16} className="shrink-0 text-blue-500" />
                        {visit.agent?.name || "Agent unavailable"}
                      </div>
                    </div>

                    {visit.property?.city && (
                      <p className="mt-2 text-xs text-slate-400">
                        Property location: {visit.property.city}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-4">
                      {visit.lead?.email && (
                        <a
                          href={`mailto:${visit.lead.email}`}
                          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600"
                        >
                          <Mail size={14} />
                          {visit.lead.email}
                        </a>
                      )}

                      {visit.lead?.phone && (
                        <a
                          href={`tel:${visit.lead.phone}`}
                          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600"
                        >
                          <Phone size={14} />
                          {visit.lead.phone}
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="w-full lg:w-48">
                    <label className="mb-2 block text-xs font-semibold text-slate-500">
                      Update status
                    </label>

                    <select
                      value={visit.status}
                      onChange={(event) =>
                        handleStatusChange(visit._id, event.target.value)
                      }
                      className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                    >
                      {visitStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4">
                  <label className="mb-2 block text-xs font-semibold text-slate-500">
                    Visit notes
                  </label>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <textarea
                      rows={2}
                      value={
                        notesDrafts[visit._id] !== undefined
                          ? notesDrafts[visit._id]
                          : visit.notes || ""
                      }
                      onChange={(event) =>
                        setNotesDrafts((current) => ({
                          ...current,
                          [visit._id]: event.target.value,
                        }))
                      }
                      placeholder="Add details about this appointment..."
                      className="min-h-11 flex-1 resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                    />

                    <button
                      type="button"
                      onClick={() => handleSaveNotes(visit._id)}
                      disabled={savingNotes === visit._id}
                      className="flex cursor-pointer items-center justify-center gap-2 self-start rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Save size={15} />
                      {savingNotes === visit._id ? "Saving..." : "Save notes"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {showModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <div className="my-auto w-full max-w-xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Schedule Property Visit
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Create an appointment for an interested customer.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close schedule form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleScheduleVisit} className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Select customer lead
                </label>

                <select
                  required
                  value={leadId}
                  onChange={(event) => handleLeadChange(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-400"
                >
                  <option value="">Choose a lead</option>

                  {leads
                    .filter((lead) => lead.property)
                    .map((lead) => (
                      <option key={lead._id} value={lead._id}>
                        {lead.name} — {lead.property?.title || "Property"}
                      </option>
                    ))}
                </select>

                {leads.length === 0 && (
                  <p className="mt-2 text-xs text-amber-600">
                    No leads are available. Create a lead linked to a property first.
                  </p>
                )}

                {selectedLead?.property && (
                  <div className="mt-3 rounded-xl bg-blue-50 p-3">
                    <p className="text-xs font-semibold text-blue-800">
                      Selected property
                    </p>

                    <p className="mt-1 text-sm text-blue-700">
                      {selectedLead.property.title}
                    </p>

                    <p className="mt-1 text-xs text-blue-600">
                      {selectedLead.property.referenceCode || ""}
                      {selectedLead.property.city
                        ? ` · ${selectedLead.property.city}`
                        : ""}
                    </p>
                  </div>
                )}
              </div>

              {isAdmin && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Assign agent
                  </label>

                  <select
                    required
                    value={agentId}
                    onChange={(event) => setAgentId(event.target.value)}
                    disabled={!leadId || availableAgents.length === 0}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-400 disabled:cursor-not-allowed disabled:bg-slate-50"
                  >
                    <option value="">Choose an active agent</option>

                    {availableAgents.map((agent) => (
                      <option key={agent._id} value={agent._id}>
                        {agent.name} — {agent.email}
                      </option>
                    ))}
                  </select>

                  {selectedLead?.assignedAgent && (
                    <p className="mt-2 text-xs text-slate-500">
                      This lead is already assigned. The visit must use the same agent.
                    </p>
                  )}

                  {leadId && availableAgents.length === 0 && (
                    <p className="mt-2 text-xs text-red-600">
                      No eligible active agent is available for this lead.
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Appointment date and time
                </label>

                <input
                  type="datetime-local"
                  required
                  min={getLocalDateTime()}
                  value={scheduledAt}
                  onChange={(event) => setScheduledAt(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-400"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Each appointment reserves a 60-minute slot for the selected agent.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Notes (optional)
                </label>

                <textarea
                  rows={3}
                  value={newNotes}
                  onChange={(event) => setNewNotes(event.target.value)}
                  placeholder="Add any instructions or appointment details..."
                  className="w-full resize-y rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-400"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="cursor-pointer rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    submitting ||
                    (isAdmin && (!agentId || availableAgents.length === 0))
                  }
                  className="cursor-pointer rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Scheduling..." : "Schedule Visit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Visits;
