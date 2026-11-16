import { useEffect, useMemo, useState } from "react";
import { Users, Search, RefreshCw, MessageSquare, Phone, Mail, CalendarDays, Building2, Send, X } from "lucide-react";
import { toast } from "react-toastify";
import api from "../api/axios";
import { useAuth } from "../context/useAuth";

const statuses = ["New", "Contacted", "Qualified", "Visit Scheduled", "Negotiation", "Converted", "Lost"];

const dateLabel = (value) => value
  ? new Date(value).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })
  : "—";

const statusStyle = (status) => ({
  New: "bg-blue-50 text-blue-700", Contacted: "bg-cyan-50 text-cyan-700",
  Qualified: "bg-violet-50 text-violet-700", "Visit Scheduled": "bg-amber-50 text-amber-700",
  Negotiation: "bg-orange-50 text-orange-700", Converted: "bg-emerald-50 text-emerald-700",
  Lost: "bg-red-50 text-red-700",
}[status] || "bg-gray-100 text-gray-700");

function Leads() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [leads, setLeads] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [expandedLeadId, setExpandedLeadId] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [busyLeadId, setBusyLeadId] = useState(null);

  const fetchLeads = async (refresh = false) => {
    if (refresh) setRefreshing(true);
    try {
      const response = await api.get("/leads");
      setLeads(response.data.leads || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load leads.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const response = await api.get("/leads");
        if (!ignore) setLeads(response.data.leads || []);
      } catch (error) {
        if (!ignore) toast.error(error.response?.data?.message || "Failed to load leads.");
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    if (!isAdmin) return undefined;
    let ignore = false;
    const loadAgents = async () => {
      try {
        const response = await api.get("/agents");
        if (!ignore) setAgents((response.data.agents || []).filter((agent) => agent.isActive && agent.role === "agent"));
      } catch (error) {
        if (!ignore) toast.error(error.response?.data?.message || "Failed to load agents.");
      }
    };
    loadAgents();
    return () => { ignore = true; };
  }, [isAdmin]);

  const visibleLeads = useMemo(() => {
    const term = search.trim().toLowerCase();
    return leads.filter((lead) => {
      const statusMatches = statusFilter === "All" || lead.status === statusFilter;
      const searchMatches = !term || [lead.name, lead.email, lead.phone, lead.property?.title, lead.property?.referenceCode]
        .filter(Boolean).some((value) => String(value).toLowerCase().includes(term));
      return statusMatches && searchMatches;
    });
  }, [leads, search, statusFilter]);

  const counts = {
    total: leads.length,
    fresh: leads.filter((lead) => lead.status === "New").length,
    active: leads.filter((lead) => !["Converted", "Lost"].includes(lead.status)).length,
    converted: leads.filter((lead) => lead.status === "Converted").length,
  };

  const changeStatus = async (leadId, status) => {
    setBusyLeadId(leadId);
    try {
      await api.patch(`/leads/${leadId}/status`, { status });
      toast.success("Lead status updated.");
      await fetchLeads();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update lead status.");
    } finally { setBusyLeadId(null); }
  };

  const assignLead = async (leadId, agentId) => {
    if (!agentId) return;
    setBusyLeadId(leadId);
    try {
      await api.patch(`/leads/${leadId}/assign`, { agentId });
      toast.success("Lead assigned successfully.");
      await fetchLeads();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to assign lead.");
    } finally { setBusyLeadId(null); }
  };

  const addNote = async (leadId) => {
    const text = noteText.trim();
    if (!text) return toast.error("Please write a note first.");
    setSavingNote(true);
    try {
      await api.post(`/leads/${leadId}/notes`, { text });
      toast.success("Follow-up note added.");
      setNoteText("");
      await fetchLeads();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add note.");
    } finally { setSavingNote(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Users size={22} /></div>
          <div><h1 className="text-2xl font-bold text-gray-900">Leads</h1><p className="text-sm text-gray-500">Manage customer inquiries and follow-ups.</p></div>
        </div>
        <button type="button" onClick={() => fetchLeads(true)} disabled={refreshing} className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60">
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[ ["Total Leads", counts.total, "All inquiries"], ["New Leads", counts.fresh, "Need attention"], ["Active Leads", counts.active, "In progress"], ["Converted", counts.converted, "Successful leads"] ].map(([label, value, detail]) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><p className="text-sm font-medium text-gray-500">{label}</p><p className="mt-2 text-2xl font-bold text-gray-900">{value}</p><p className="mt-1 text-xs text-gray-400">{detail}</p></div>
        ))}
      </div>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="font-semibold text-gray-900">Customer inquiries</h2><p className="mt-1 text-sm text-gray-500">Showing {visibleLeads.length} of {leads.length} leads</p></div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search leads..." className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-64" /></div>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"><option value="All">All statuses</option>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select>
          </div>
        </div>

        {loading ? <div className="flex justify-center py-16 text-sm text-gray-500"><RefreshCw size={18} className="mr-2 animate-spin" /> Loading leads...</div>
          : visibleLeads.length === 0 ? <div className="px-4 py-16 text-center"><Users size={28} className="mx-auto text-gray-300" /><h3 className="mt-3 font-semibold text-gray-900">No leads found</h3><p className="mt-1 text-sm text-gray-500">{leads.length ? "Try another search or status filter." : "Customer inquiries will appear here when someone contacts your agency."}</p></div>
          : <div className="divide-y divide-gray-100">
            {visibleLeads.map((lead) => {
              const expanded = expandedLeadId === lead._id;
              return <article key={lead._id} className="p-4 sm:p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-gray-900">{lead.name}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle(lead.status)}`}>{lead.status}</span><span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs capitalize text-gray-600">{lead.source || "website"}</span></div>
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
                      {lead.email && <span className="inline-flex items-center gap-1.5"><Mail size={14} />{lead.email}</span>}
                      <span className="inline-flex items-center gap-1.5"><Phone size={14} />{lead.phone}</span>
                      <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} />{dateLabel(lead.createdAt)}</span>
                    </div>
                    <div className="mt-3 rounded-lg bg-gray-50 p-3"><div className="flex items-start gap-2"><Building2 size={16} className="mt-0.5 shrink-0 text-gray-400" /><div><p className="text-sm font-medium text-gray-800">{lead.property?.title || "Property unavailable"}</p><p className="mt-0.5 text-xs text-gray-500">{lead.property?.referenceCode || "No reference code"}{lead.property?.city ? ` · ${lead.property.city}` : ""}{lead.property?.price != null ? ` · Rs ${Number(lead.property.price).toLocaleString("en-PK")}` : ""}</p></div></div>{lead.message && <p className="mt-2 border-t border-gray-200 pt-2 text-sm text-gray-600">{lead.message}</p>}</div>
                    {isAdmin ? <div className="mt-3 flex flex-wrap items-center gap-2 text-sm"><span className="text-gray-500">Assigned to:</span><select value={lead.assignedAgent?._id || ""} onChange={(event) => assignLead(lead._id, event.target.value)} disabled={busyLeadId === lead._id} className="max-w-full cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"><option value="">{lead.assignedAgent?.name || "Select an agent"}</option>{agents.map((agent) => <option key={agent._id} value={agent._id}>{agent.name}</option>)}</select>{busyLeadId === lead._id && <span className="text-xs text-gray-400">Saving...</span>}</div> : <p className="mt-3 text-xs text-gray-500">Assigned to you</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                    <select value={lead.status} onChange={(event) => changeStatus(lead._id, event.target.value)} disabled={busyLeadId === lead._id} className="cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60">{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select>
                    <button type="button" onClick={() => { setExpandedLeadId(expanded ? null : lead._id); setNoteText(""); }} className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"><MessageSquare size={16} /> Notes ({lead.notes?.length || 0})</button>
                  </div>
                </div>
                {expanded && <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="mb-3 flex items-center justify-between"><h4 className="font-semibold text-gray-900">Follow-up notes</h4><button type="button" onClick={() => { setExpandedLeadId(null); setNoteText(""); }} aria-label="Close notes" className="cursor-pointer rounded-md p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700"><X size={18} /></button></div>
                  {lead.notes?.length ? <div className="mb-4 space-y-3">{lead.notes.map((note, index) => <div key={note._id || `${lead._id}-${index}`} className="rounded-lg border border-gray-200 bg-white p-3"><p className="whitespace-pre-wrap text-sm text-gray-700">{note.text}</p><p className="mt-2 text-xs text-gray-400">{note.addedBy?.name || "Team member"}{note.createdAt ? ` · ${dateLabel(note.createdAt)}` : ""}</p></div>)}</div> : <p className="mb-4 text-sm text-gray-500">No follow-up notes yet.</p>}
                  <div className="flex flex-col gap-2 sm:flex-row"><input value={noteText} onChange={(event) => setNoteText(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") addNote(lead._id); }} placeholder="Write a follow-up note..." className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500" /><button type="button" onClick={() => addNote(lead._id)} disabled={savingNote || !noteText.trim()} className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"><Send size={15} />{savingNote ? "Saving..." : "Add note"}</button></div>
                </div>}
              </article>;
            })}
          </div>}
      </section>
    </div>
  );
}

export default Leads;
