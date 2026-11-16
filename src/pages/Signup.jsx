
import { useState } from "react";
import {
    Building2,
    UserRound,
    Mail,
    LockKeyhole,
    Eye,
    EyeOff,
    ArrowRight,
    MapPin,
    Phone,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import api from "../api/axios";

function Signup() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        agencyName: "",
        phone: "",
        address: "",
        city: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { password, confirmPassword } = formData;

        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        if (
            !formData.name.trim() ||
            !formData.email.trim() ||
            !formData.password ||
            !formData.agencyName.trim()
        ) {
            toast.error("Please complete all required fields.");
            return;
        }

        if (formData.password.length < 8) {
            toast.error("Password must be at least 8 characters.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            const registrationData = { ...formData };
            delete registrationData.confirmPassword;

            await api.post("/auth/register", registrationData);

            toast.success("Account created! You can now sign in.");

            navigate("/login");
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Registration failed. Please try again."
            );
        } 
finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden grid md:grid-cols-2">
                {/* Branding */}
                <div className="hidden md:flex flex-col justify-between bg-slate-900 text-white p-10">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-600 p-3 rounded-xl">
                                <Building2 size={27} />
                            </div>

                            <span className="text-2xl font-bold">
                                AqarFlow
                            </span>
                        </div>

                        <div className="mt-24">
                            <h1 className="text-4xl font-bold leading-tight">
                                Start Your Agency.
                                <br />
                                Manage Properties.
                                <br />
                                Grow Your Business.
                            </h1>

                            <p className="text-slate-400 mt-6 leading-7">
                                Create your agency workspace and manage
                                properties, customers, visits, and deals
                                from one platform.
                            </p>
                        </div>
                    </div>

                    <p className="text-slate-500 text-sm">
                        © 2026 AqarFlow. All rights reserved.
                    </p>
                </div>

                {/* Signup Form */}
                <div className="p-7 sm:p-10 lg:p-12 flex flex-col justify-center">
                    <div className="md:hidden flex items-center gap-2 mb-8">
                        <Building2 className="text-blue-600" size={30} />
                        <span className="text-2xl font-bold text-slate-900">
                            AqarFlow
                        </span>
                    </div>

                    <div className="mb-7">
                        <h2 className="text-3xl font-bold text-slate-900">
                            Create your account
                        </h2>

                        <p className="text-slate-500 mt-2">
                            Register your agency to get started.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Personal Details */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Your full name *
                            </label>

                            <div className="relative">
                                <UserRound
                                    size={19}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    autoComplete="name"
                                    required
                                    className="w-full border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Email address *
                            </label>

                            <div className="relative">
                                <Mail
                                    size={19}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    autoComplete="email"
                                    required
                                    className="w-full border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        {/* Agency Details */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Agency name *
                            </label>

                            <div className="relative">
                                <Building2
                                    size={19}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type="text"
                                    name="agencyName"
                                    value={formData.agencyName}
                                    onChange={handleChange}
                                    placeholder="Enter your agency name"
                                    required
                                    className="w-full border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Phone
                                </label>

                                <div className="relative">
                                    <Phone
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="Phone number"
                                        autoComplete="tel"
                                        className="w-full border border-slate-200 rounded-xl py-3 pl-11 pr-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    City
                                </label>

                                <div className="relative">
                                    <MapPin
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="City"
                                        autoComplete="address-level2"
                                        className="w-full border border-slate-200 rounded-xl py-3 pl-11 pr-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Agency address
                            </label>

                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Enter agency address"
                                autoComplete="street-address"
                                className="w-full border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Password *
                            </label>

                            <div className="relative">
                                <LockKeyhole
                                    size={19}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="At least 8 characters"
                                    autoComplete="new-password"
                                    minLength={8}
                                    required
                                    className="w-full border border-slate-200 rounded-xl py-3 pl-12 pr-12 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Confirm password *
                            </label>

                            <div className="relative">
                                <LockKeyhole
                                    size={19}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm your password"
                                    autoComplete="new-password"
                                    required
                                    className="w-full border border-slate-200 rounded-xl py-3 pl-12 pr-12 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(!showConfirmPassword)
                                    }
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    aria-label={
                                        showConfirmPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff size={19} />
                                    ) : (
                                        <Eye size={19} />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition"
                        >
                            {loading ? (
                                "Creating account..."
                            ) : (
                                <>
                                    Create account
                                    <ArrowRight size={19} />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-500 mt-6">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="font-semibold text-blue-600 hover:text-blue-700"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Signup;
