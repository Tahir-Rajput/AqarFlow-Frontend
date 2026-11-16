
import { useEffect, useState } from "react";
import Properties from "./pages/Properties.jsx";
import Visits from "./pages/Visits.jsx";
import Deals from "./pages/Deals.jsx";
import SettingsPage from "./pages/Settings.jsx";


import {
  LayoutDashboard,
  Building2,
  Users,
  CalendarDays,
  Handshake,
  UserRound,
  Settings,
  Search,
  Bell,
  Menu,
  X,
  Plus,
  ArrowUpRight,
  MapPin,
  MoreHorizontal,
  Home,
  Clock3,
  CheckCircle2,
  TrendingUp,
  Construction,
  LogOut,
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";

import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Agents from "./pages/Agents.jsx";
import Leads from "./pages/Leads.jsx";

import { useAuth } from "./context/useAuth";
import api from "./api/axios";

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Properties", icon: Building2 },
  { label: "Leads", icon: Users },
  { label: "Visits", icon: CalendarDays },
  { label: "Deals", icon: Handshake },
  { label: "Agents", icon: UserRound },
  { label: "Settings", icon: Settings },
];

const pageDescriptions = {
  Dashboard: "Monitor your agency performance and daily activities.",
  Properties: "Manage, publish, and organize your property listings.",
  Leads: "Track customer inquiries and manage your sales pipeline.",
  Visits: "Manage property visits and customer appointments.",
  Deals: "Track negotiations and manage your property deals.",
  Agents: "Manage your agency team and agent accounts.",
  Settings: "Manage your agency account and application preferences.",
};

const statCards = [
  {
    key: "totalProperties",
    title: "Total Properties",
    icon: Building2,
    color: "blue",
    description: "Published and available properties",
  },
  {
    key: "newLeads",
    title: "New Leads",
    icon: Users,
    color: "violet",
    description: "New customer inquiries",
  },
  {
    key: "upcomingVisits",
    title: "Upcoming Visits",
    icon: CalendarDays,
    color: "orange",
    description: "Upcoming property appointments",
  },
  {
    key: "openDeals",
    title: "Active Deals",
    icon: Handshake,
    color: "green",
    description: "Deals currently in progress",
  },
];

const chartData = [
  { month: "Jan", revenue: 180000 },
  { month: "Feb", revenue: 250000 },
  { month: "Mar", revenue: 210000 },
  { month: "Apr", revenue: 320000 },
  { month: "May", revenue: 280000 },
  { month: "Jun", revenue: 410000 },
  { month: "Jul", revenue: 370000 },
  { month: "Aug", revenue: 490000 },
  { month: "Sep", revenue: 430000 },
  { month: "Oct", revenue: 560000 },
  { month: "Nov", revenue: 620000 },
  { month: "Dec", revenue: 710000 },
];

const leads = [
  {
    name: "Ali Hassan",
    email: "ali@example.com",
    property: "Modern Family House",
    date: "Today, 10:30 AM",
    status: "Qualified",
    initials: "AH",
  },
  {
    name: "Muhammad Ahmed",
    email: "ahmed@example.com",
    property: "Modern 10 Marla House",
    date: "Today, 09:15 AM",
    status: "Contacted",
    initials: "MA",
  },
  {
    name: "Sara Khan",
    email: "sara@example.com",
    property: "Luxury Apartment",
    date: "Yesterday",
    status: "New",
    initials: "SK",
  },
];

const properties = [
  {
    name: "Modern Family House",
    location: "DHA Phase 6, Lahore",
    price: "PKR 2.5 Crore",
    type: "House",
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600",
    status: "Published",
  },
  {
    name: "Luxury Modern Villa",
    location: "Bahria Town, Lahore",
    price: "PKR 3.8 Crore",
    type: "Villa",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600",
    status: "Published",
  },
];

function DashboardPage({ onNavigate }) {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  const iconColors = {
    blue: "bg-blue-50 text-blue-600",
    violet: "bg-violet-50 text-violet-600",
    orange: "bg-orange-50 text-orange-600",
    green: "bg-emerald-50 text-emerald-600",
  };

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardStats = async () => {
      try {
        setStatsError("");

        const response = await api.get("/dashboard");

        if (isMounted) {
          setDashboardStats(response.data.stats);
        }
      } catch (error) {
        console.error("Dashboard stats error:", error);

        if (isMounted) {
          setStatsError(
            error.response?.data?.message ||
            "Failed to load dashboard statistics."
          );
        }
      } finally {
        if (isMounted) {
          setStatsLoading(false);
        }
      }
    };

    fetchDashboardStats();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-7">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-1 text-sm font-medium text-blue-600">
            Overview
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Track your agency performance and daily activities.
          </p>
        </div>

        <button
          onClick={() => onNavigate("Properties")}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Property
        </button>
      </section>

      <section>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.key}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">
                    {stat.title}
                  </p>

                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconColors[stat.color]}`}
                  >
                    <Icon size={21} />
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-3xl font-bold tracking-tight text-slate-900">
                    {statsLoading
                      ? "..."
                      : statsError
                        ? "—"
                        : dashboardStats?.[stat.key] ?? 0}
                  </h3>
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>

        {statsError && (
          <p className="mt-3 text-sm text-red-600">
            {statsError}
          </p>
        )}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm md:p-6 xl:col-span-2">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900">
                Revenue Overview
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Monthly agency performance
              </p>
            </div>

            <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 outline-none">
              <option>2026</option>
              <option>2025</option>
            </select>
          </div>

          <div className="mb-4">
            <h2 className="text-2xl font-bold text-slate-900">
              PKR 7.1M
            </h2>

            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600">
              <ArrowUpRight size={14} />
              12.8% growth this year
            </p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 8, left: -15, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="#f1f5f9"
                  strokeDasharray="4 4"
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  dy={10}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  tickFormatter={(value) => `${value / 1000}k`}
                />

                <Tooltip
                  formatter={(value) => [
                    `PKR ${Number(value).toLocaleString()}`,
                    "Revenue",
                  ]}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900">
                Today's Activity
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Your agency summary
              </p>
            </div>

            <MoreHorizontal size={20} className="text-slate-400" />
          </div>

          <div className="space-y-6">
            <ActivityItem
              icon={Users}
              title="New inquiries"
              description="Customer inquiries received"
              value="08"
              color="blue"
            />

            <ActivityItem
              icon={CalendarDays}
              title="Property visits"
              description="Scheduled appointments"
              value="05"
              color="orange"
            />

            <ActivityItem
              icon={CheckCircle2}
              title="Deals updated"
              description="Pipeline progress"
              value="03"
              color="green"
            />

            <ActivityItem
              icon={Clock3}
              title="Pending follow-ups"
              description="Customers to contact"
              value="06"
              color="violet"
            />
          </div>

          <button
            onClick={() => onNavigate("Visits")}
            className="mt-7 w-full cursor-pointer rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            View all activity
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5 md:px-6">
          <div>
            <h3 className="font-bold text-slate-900">
              Recent Leads
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              Latest customer inquiries
            </p>
          </div>

          <button
            onClick={() => onNavigate("Leads")}
            className="cursor-pointer text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            View all leads →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-162.5 text-left">
            <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Interested In</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {leads.map((lead) => (
                <tr key={lead.email} className="transition hover:bg-slate-50/70">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">
                        {lead.initials}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {lead.name}
                        </p>

                        <p className="text-xs text-slate-400">
                          {lead.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {lead.property}
                  </td>

                  <td className="px-6 py-4 text-xs text-slate-500">
                    {lead.date}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${lead.status === "Qualified"
                          ? "bg-emerald-50 text-emerald-700"
                          : lead.status === "Contacted"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-orange-50 text-orange-700"
                        }`}
                    >
                      {lead.status}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <button
                      aria-label={`Open ${lead.name} lead`}
                      onClick={() => onNavigate("Leads")}
                      className="cursor-pointer rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      <MoreHorizontal size={19} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900">
              Recent Properties
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              Latest properties added to your agency
            </p>
          </div>

          <button
            onClick={() => onNavigate("Properties")}
            className="cursor-pointer text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            View all properties →
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {properties.map((property) => (
            <article
              key={property.name}
              className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="relative h-52 overflow-hidden bg-slate-100">
                <img
                  src={property.image}
                  alt={property.name}
                  className="h-full w-full object-cover transition duration-500 hover:scale-105"
                />

                <span className="absolute left-4 top-4 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white">
                  {property.status}
                </span>

                <span className="absolute right-4 top-4 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700">
                  {property.type}
                </span>
              </div>

              <div className="p-5">
                <h4 className="font-bold text-slate-900">
                  {property.name}
                </h4>

                <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                  <MapPin size={14} />
                  {property.location}
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                  <p className="text-lg font-bold text-blue-600">
                    {property.price}
                  </p>

                  <button
                    aria-label={`View ${property.name}`}
                    onClick={() => onNavigate("Properties")}
                    className="cursor-pointer rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <ArrowUpRight size={18} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function ActivityItem({ icon: Icon, title, description, value, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    green: "bg-emerald-50 text-emerald-600",
    violet: "bg-violet-50 text-violet-600",
  };

  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${colors[color]}`}
      >
        <Icon size={20} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-slate-400">{description}</p>
      </div>

      <span className="text-lg font-bold">{value}</span>
    </div>
  );
}

function PlaceholderPage({ page, onNavigate }) {
  const currentPage = navigation.find((item) => item.label === page);
  const Icon = currentPage?.icon || Construction;

  return (
    <section className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm md:p-12">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Icon size={30} />
        </div>

        <h1 className="text-2xl font-bold text-slate-900">
          {page}
        </h1>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
          {pageDescriptions[page]}
        </p>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-xs font-semibold text-orange-700">
          <Construction size={15} />
          Page under development
        </div>

        <p className="mt-5 text-xs leading-5 text-slate-400">
          We will build this section and connect it to the AqarFlow backend.
          Its data and actions are not available yet.
        </p>

        <button
          onClick={() => onNavigate("Dashboard")}
          className="mt-7 cursor-pointer rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Back to Dashboard
        </button>
      </div>
    </section>
  );
}

function DashboardLayout() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.name || "User";

  const roleLabel =
    user?.role === "admin"
      ? "Administrator"
      : user?.role === "agent"
        ? "Agent"
        : user?.role || "User";

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const handleNavigate = (page) => {
    setActivePage(page);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-800">
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-65 flex-col bg-[#111c36] text-white transition-transform duration-300 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500">
              <Home size={20} />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-wide">
                AqarFlow
              </h1>

              <p className="text-[10px] tracking-[2px] text-slate-400">
                REAL ESTATE CRM
              </p>
            </div>
          </div>

          <button
            onClick={() => setMobileMenuOpen(false)}
            className="cursor-pointer text-slate-400 md:hidden"
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        <div className="px-5 pt-8">
          <p className="mb-4 px-3 text-[10px] font-semibold tracking-[2px] text-slate-500">
            WORKSPACE
          </p>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = activePage === item.label;

              return (
                <button
                  key={item.label}
                  onClick={() => handleNavigate(item.label)}
                  className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${active
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-950/30"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                >
                  <Icon size={19} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto px-5 pb-6">
          <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-2 flex items-center gap-2">
              <TrendingUp size={17} className="text-blue-400" />

              <span className="text-sm font-semibold">
                Grow your agency
              </span>
            </div>

            <p className="mb-3 text-xs leading-5 text-slate-400">
              Manage properties and customers from one workspace.
            </p>

            <button
              onClick={() => handleNavigate("Properties")}
              className="cursor-pointer text-xs font-semibold text-blue-400 hover:text-blue-300"
            >
              Explore features →
            </button>
          </div>

          <div className="flex items-center gap-3 border-t border-white/10 pt-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 font-semibold">
              {initials || "U"}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {displayName}
              </p>

              <p className="text-xs text-slate-400">
                {roleLabel}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Sign out"
              aria-label="Sign out"
              className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {mobileMenuOpen && (
        <button
          aria-label="Close navigation overlay"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 cursor-pointer bg-slate-950/50 md:hidden"
        />
      )}

      <main className="min-h-screen md:ml-65">
        <header className="sticky top-0 z-30 flex h-20.5 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="cursor-pointer rounded-lg p-2 hover:bg-slate-100 md:hidden"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {activePage}
              </h2>

              <p className="hidden text-xs text-slate-400 sm:block">
                {pageDescriptions[activePage]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            <div className="hidden h-10 w-64 items-center gap-2 rounded-xl bg-slate-100 px-3 lg:flex">
              <Search size={17} className="text-slate-400" />

              <input
                type="text"
                placeholder="Search anything..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />

              <span className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-400">
                /
              </span>
            </div>

            <button
              aria-label="Notifications"
              className="relative cursor-pointer rounded-xl p-2.5 text-slate-500 hover:bg-slate-100"
            >
              <Bell size={20} />

              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
            </button>

            <div className="flex items-center gap-2 border-l border-slate-200 pl-3 md:pl-5">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold">
                  {displayName}
                </p>

                <p className="text-xs text-slate-400">
                  {roleLabel}
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                {initials || "U"}
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1600px] p-4 md:p-8">
          {activePage === "Dashboard" ? (
            <DashboardPage onNavigate={handleNavigate} />
          ) : activePage === "Agents" ? (
            <Agents />
          ) : activePage === "Properties" ? (
            <Properties />
          ) : activePage === "Leads" ? (
            <Leads />
          ) : activePage === "Visits" ? (
            <Visits />
          ) : activePage === "Deals" ? (
            <Deals />
          ) : activePage === "Settings" ? (
            <SettingsPage />
          ) : (
            <PlaceholderPage
              page={activePage}
              onNavigate={handleNavigate}
            />
          )}

          <footer className="mt-8 border-t border-slate-200 py-6 text-center text-xs text-slate-400">
            © 2026 AqarFlow. Real Estate Management Platform.
          </footer>
        </div>
      </main>
    </div>
  );
}

function App() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-xl bg-white px-6 py-4 text-sm font-medium text-slate-600 shadow-sm">
          Checking your session...
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login />
          )
        }
      />

      <Route
        path="/signup"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Signup />
          )
        }
      />

      <Route
        path="/dashboard"
        element={
          isAuthenticated ? (
            <DashboardLayout />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to={isAuthenticated ? "/dashboard" : "/login"}
            replace
          />
        }
      />
    </Routes>
  );
}

export default App;

