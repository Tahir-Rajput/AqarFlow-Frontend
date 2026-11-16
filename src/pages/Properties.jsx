
import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  RefreshCw,
  Search,
  MapPin,
  Eye,
  EyeOff,
  Home,
  Plus,
  X,
  ImagePlus,
  Pencil,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "../api/axios";
import { useAuth } from "../context/useAuth";

const initialFormData = {
  title: "",
  referenceCode: "",
  description: "",
  purpose: "sale",
  category: "house",
  price: "",
  currency: "PKR",
  area: "",
  areaUnit: "Marla",
  bedrooms: "0",
  bathrooms: "0",
  address: "",
  city: "",
  locality: "",
  furnishing: "unfurnished",
  ownerName: "",
  ownerPhone: "",
  assignedAgent: "",
  amenities: "",
};

function Properties() {
  const { user } = useAuth();

  const [properties, setProperties] = useState([]);
  const [agents, setAgents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);

  const [formData, setFormData] = useState(initialFormData);
  const [images, setImages] = useState([]);

  const isAdmin = user?.role === "admin";

  const fetchProperties = useCallback(async () => {
    try {
      const response = await api.get("/properties");
      setProperties(response.data.properties || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to load properties."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadProperties = async () => {
      try {
        const response = await api.get("/properties");

        if (!ignore) {
          setProperties(response.data.properties || []);
        }
      } catch (error) {
        if (!ignore) {
          toast.error(
            error.response?.data?.message ||
              "Failed to load properties."
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadProperties();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!isAdmin) return;

    let ignore = false;

    const loadAgents = async () => {
      try {
        const response = await api.get("/agents");

        if (!ignore) {
          setAgents(
            (response.data.agents || []).filter(
              (agent) => agent.isActive !== false
            )
          );
        }
      } catch (error) {
        if (!ignore) {
          toast.error(
            error.response?.data?.message ||
              "Failed to load agents."
          );
        }
      }
    };

    loadAgents();

    return () => {
      ignore = true;
    };
  }, [isAdmin]);

  const handleRefresh = async () => {
    setLoading(true);
    await fetchProperties();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (selectedFiles.length > 10) {
      toast.error("You can upload a maximum of 10 images.");
      event.target.value = "";
      return;
    }

    const invalidFile = selectedFiles.find(
      (file) =>
        !["image/jpeg", "image/png", "image/webp"].includes(
          file.type
        ) || file.size > 5 * 1024 * 1024
    );

    if (invalidFile) {
      toast.error(
        "Images must be JPG, PNG, or WEBP and maximum 5 MB each."
      );
      event.target.value = "";
      return;
    }

    setImages(selectedFiles);
  };

  const handleEditProperty = (property) => {
    setEditingProperty(property);

    setFormData({
      title: property.title || "",
      referenceCode: property.referenceCode || "",
      description: property.description || "",
      purpose: property.purpose || "sale",
      category: property.category || "house",
      price: String(property.price ?? ""),
      currency: property.currency || "PKR",
      area: String(property.area ?? ""),
      areaUnit: property.areaUnit || "Marla",
      bedrooms: String(property.bedrooms ?? 0),
      bathrooms: String(property.bathrooms ?? 0),
      address: property.address || "",
      city: property.city || "",
      locality: property.locality || "",
      furnishing: property.furnishing || "unfurnished",
      ownerName: property.ownerName || "",
      ownerPhone: property.ownerPhone || "",
      assignedAgent:
        property.assignedAgent?._id ||
        property.assignedAgent ||
        "",
      amenities: Array.isArray(property.amenities)
        ? property.amenities.join(", ")
        : "",
    });

    setImages([]);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setImages([]);
    setEditingProperty(null);
    setShowForm(false);
  };

  const handleSaveProperty = async (event) => {
    event.preventDefault();

    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.price ||
      !formData.area ||
      !formData.address.trim() ||
      !formData.city.trim() ||
      (!editingProperty && !formData.referenceCode.trim())
    ) {
      toast.error("Please complete all required fields.");
      return;
    }

    if (
      Number(formData.price) < 0 ||
      Number(formData.area) <= 0
    ) {
      toast.error("Enter a valid price and area.");
      return;
    }

    const data = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      // The backend does not allow referenceCode to be changed.
      if (editingProperty && key === "referenceCode") {
        return;
      }

      if (key === "amenities") {
        value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
          .forEach((item) => data.append("amenities", item));

        return;
      }

      if (value !== "") {
        data.append(key, value);
      }
    });

    images.forEach((image) => {
      data.append("images", image);
    });

    try {
      setSubmitting(true);

      if (editingProperty) {
        await api.patch(
          `/properties/${editingProperty._id}`,
          data,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        toast.success("Property updated successfully.");
      } else {
        await api.post("/properties", data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        toast.success("Property created successfully.");
      }

      resetForm();
      await fetchProperties();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          (editingProperty
            ? "Failed to update property."
            : "Failed to create property.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublishToggle = async (property) => {
    const newStatus = !property.isPublished;

    try {
      setUpdatingId(property._id);

      await api.patch(
        `/properties/${property._id}/publish`,
        {
          isPublished: newStatus,
        }
      );

      toast.success(
        newStatus
          ? "Property published successfully."
          : "Property unpublished successfully."
      );

      await fetchProperties();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update property visibility."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredProperties = properties.filter((property) => {
    const searchValue = search.toLowerCase();

    return (
      property.title?.toLowerCase().includes(searchValue) ||
      property.referenceCode?.toLowerCase().includes(searchValue) ||
      property.city?.toLowerCase().includes(searchValue) ||
      property.locality?.toLowerCase().includes(searchValue) ||
      property.address?.toLowerCase().includes(searchValue)
    );
  });

  const publishedProperties = properties.filter(
    (property) => property.isPublished
  ).length;

  const draftProperties =
    properties.length - publishedProperties;

  const formatPrice = (price, currency = "PKR") => {
    try {
      return new Intl.NumberFormat("en-PK", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(Number(price) || 0);
    } catch {
      return `${currency} ${Number(price) || 0}`;
    }
  };

  const getImage = (property) => {
    const image = property.images?.[0];

    if (typeof image === "string") return image;

    return image?.url || image?.secure_url || "";
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Properties
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage, publish, and organize your property listings.
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
            onClick={() => setShowForm((previous) => !previous)}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            {showForm ? <X size={17} /> : <Plus size={17} />}
            {showForm ? "Close Form" : "Add Property"}
          </button>
        </div>
      </div>

      {/* Create Property Form */}
      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingProperty ? "Edit Property" : "Create New Property"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {editingProperty
                ? "Update the property information below."
                : "Enter the property details below."}
            </p>
          </div>

          <form
            onSubmit={handleSaveProperty}
            className="space-y-6"
          >
            {/* Basic Details */}
            <div>
              <h3 className="mb-4 font-semibold text-gray-800">
                Basic Information
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Property Title *
                  </label>

                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Modern Family House"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Reference Code *
                  </label>

                  <input
                    name="referenceCode"
                    value={formData.referenceCode}
                    onChange={handleChange}
                    placeholder="e.g. AQF-003"
                    required
                    readOnly={Boolean(editingProperty)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 read-only:bg-gray-100 read-only:text-gray-500"
                  />
                  {editingProperty && (
                    <p className="mt-1 text-xs text-gray-500">
                      Reference codes cannot be changed after creation.
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Description *
                  </label>

                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    required
                    placeholder="Describe the property..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Purpose *
                  </label>

                  <select
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
                  >
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Property Category *
                  </label>

                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
                  >
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="plot">Plot</option>
                    <option value="commercial">Commercial</option>
                    <option value="office">Office</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Price and Area */}
            <div className="border-t border-gray-100 pt-5">
              <h3 className="mb-4 font-semibold text-gray-800">
                Price and Area
              </h3>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Price *
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="25000000"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Currency
                  </label>

                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
                  >
                    <option value="PKR">PKR</option>
                    <option value="USD">USD</option>
                    <option value="AED">AED</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Area *
                  </label>

                  <input
                    type="number"
                    min="0.01"
                    step="any"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    placeholder="10"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Area Unit
                  </label>

                  <select
                    name="areaUnit"
                    value={formData.areaUnit}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
                  >
                    <option value="Marla">Marla</option>
                    <option value="Kanal">Kanal</option>
                    <option value="Square Feet">Square Feet</option>
                    <option value="Square Yards">Square Yards</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Bedrooms
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Bathrooms
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="border-t border-gray-100 pt-5">
              <h3 className="mb-4 font-semibold text-gray-800">
                Location Information
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Full Address *
                  </label>

                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="House address, street, phase..."
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    City *
                  </label>

                  <input
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Lahore"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Locality
                  </label>

                  <input
                    name="locality"
                    value={formData.locality}
                    onChange={handleChange}
                    placeholder="DHA Phase 6"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="border-t border-gray-100 pt-5">
              <h3 className="mb-4 font-semibold text-gray-800">
                Additional Information
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Furnishing
                  </label>

                  <select
                    name="furnishing"
                    value={formData.furnishing}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
                  >
                    <option value="unfurnished">Unfurnished</option>
                    <option value="furnished">Furnished</option>
                    <option value="semi-furnished">Semi-furnished</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Amenities
                  </label>

                  <input
                    name="amenities"
                    value={formData.amenities}
                    onChange={handleChange}
                    placeholder="Parking, Garden, Security"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
                  />

                  <p className="mt-1 text-xs text-gray-500">
                    Separate amenities with commas.
                  </p>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Owner Name
                  </label>

                  <input
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleChange}
                    placeholder="Property owner name"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Owner Phone
                  </label>

                  <input
                    name="ownerPhone"
                    value={formData.ownerPhone}
                    onChange={handleChange}
                    placeholder="03XXXXXXXXX"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
                  />
                </div>

                {isAdmin && (
                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Assign Agent (Optional)
                    </label>

                    <select
                      name="assignedAgent"
                      value={formData.assignedAgent}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
                    >
                      <option value="">No agent assigned</option>

                      {agents.map((agent) => (
                        <option key={agent._id} value={agent._id}>
                          {agent.name} ({agent.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Images */}
            <div className="border-t border-gray-100 pt-5">
              <h3 className="mb-3 font-semibold text-gray-800">
                Property Images
              </h3>

              {editingProperty?.images?.length > 0 && images.length === 0 && (
                <div className="mb-4">
                  <p className="mb-2 text-sm font-medium text-gray-700">
                    Current images
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {editingProperty.images.map((image, index) => {
                      const imageUrl =
                        typeof image === "string"
                          ? image
                          : image?.url || image?.secure_url;

                      return imageUrl ? (
                        <img
                          key={`${imageUrl}-${index}`}
                          src={imageUrl}
                          alt={`Current property ${index + 1}`}
                          className="h-20 w-24 rounded-lg object-cover"
                        />
                      ) : null;
                    })}
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Selecting new images will replace the current images.
                  </p>
                </div>
              )}

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-8 text-center hover:border-blue-400 hover:bg-blue-50">
                <ImagePlus
                  size={32}
                  className="mb-2 text-gray-400"
                />

                <span className="text-sm font-medium text-gray-700">
                  Click to upload property images
                </span>

                <span className="mt-1 text-xs text-gray-500">
                  JPG, PNG or WEBP. Maximum 10 images, 5 MB each.
                </span>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {images.length > 0 && (
                <div className="mt-3 space-y-1">
                  <p className="text-sm font-medium text-gray-700">
                    Selected images ({images.length})
                  </p>

                  {images.map((image, index) => (
                    <p
                      key={`${image.name}-${index}`}
                      className="text-xs text-gray-500"
                    >
                      {image.name}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-5">
              <button
                type="submit"
                disabled={submitting}
                className="cursor-pointer rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? editingProperty
                    ? "Saving Changes..."
                    : "Creating Property..."
                  : editingProperty
                    ? "Save Changes"
                    : "Create Property"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="cursor-pointer rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Total Properties
            </p>
            <Building2 size={20} className="text-blue-600" />
          </div>

          <p className="mt-3 text-2xl font-bold text-gray-900">
            {properties.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Published</p>
            <Eye size={20} className="text-green-600" />
          </div>

          <p className="mt-3 text-2xl font-bold text-green-600">
            {publishedProperties}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Unpublished</p>
            <EyeOff size={20} className="text-orange-600" />
          </div>

          <p className="mt-3 text-2xl font-bold text-orange-600">
            {draftProperties}
          </p>
        </div>
      </div>

      {/* Property Listings */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-gray-900">
              Property Listings
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              View and manage your agency properties.
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
              placeholder="Search properties..."
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 sm:w-64"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-gray-500">
            Loading properties...
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="p-10 text-center">
            <Home
              className="mx-auto mb-3 text-gray-300"
              size={36}
            />

            <p className="font-medium text-gray-700">
              No properties found
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Your property listings will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-237.5 text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-3">Property</th>
                  <th className="px-5 py-3">Location</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Visibility</th>
                  <th className="px-5 py-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredProperties.map((property) => (
                  <tr
                    key={property._id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {getImage(property) ? (
                          <img
                            src={getImage(property)}
                            alt={property.title}
                            className="h-12 w-14 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-14 items-center justify-center rounded-lg bg-gray-100">
                            <Building2
                              size={22}
                              className="text-gray-400"
                            />
                          </div>
                        )}

                        <div>
                          <p className="font-medium text-gray-900">
                            {property.title}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {property.referenceCode || "No reference"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <MapPin size={14} />
                        <span>
                          {property.locality
                            ? `${property.locality}, ${property.city}`
                            : property.city ||
                              property.address ||
                              "Not specified"}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-medium text-gray-900">
                      {formatPrice(
                        property.price,
                        property.currency
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium capitalize text-blue-700">
                        {property.status || "available"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          property.isPublished
                            ? "bg-green-50 text-green-700"
                            : "bg-orange-50 text-orange-700"
                        }`}
                      >
                        {property.isPublished
                          ? "Published"
                          : "Unpublished"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditProperty(property)}
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-blue-200 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>

                        {isAdmin && (
                          <button
                            onClick={() => handlePublishToggle(property)}
                            disabled={updatingId === property._id}
                            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60 ${
                              property.isPublished
                                ? "border-orange-200 text-orange-600 hover:bg-orange-50"
                                : "border-green-200 text-green-600 hover:bg-green-50"
                            }`}
                          >
                            {property.isPublished ? (
                              <>
                                <EyeOff size={14} />
                                Unpublish
                              </>
                            ) : (
                              <>
                                <Eye size={14} />
                                Publish
                              </>
                            )}
                          </button>
                        )}
                      </div>
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

export default Properties;
