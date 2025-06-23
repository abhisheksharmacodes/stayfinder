"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Snackbar from "../../../components/Snackbar";

const API_URL = "https://glen-21u1.vercel.app/api/listings";

async function uploadImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "abcd123"); // Replace with your Cloudinary preset

  const res = await fetch("https://api.cloudinary.com/v1_1/dtuk850ut/upload", {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!data.secure_url) {
    throw new Error(data.error?.message || "Upload failed");
  }
  return data.secure_url;
}

const initialState = {
  title: "",
  location: "",
  city: "",
  bedrooms: 1,
  beds: 1,
  bathrooms: 1,
  description: "",
  host: { name: "", yearsHosting: 1, avatar: "" },
  price: 100,
  currency: "₹",
  coordinates: { long: 100, lat: 100 },
  additionalImages: [],
};

// Utility: Convert DMS (degrees, minutes, seconds) to decimal degrees
function dmsToDecimal(dms) {
  // Example: 25°47'02.4"N or 77°13'35.3"E
  const regex = /([0-9.]+)[°\s]+([0-9.]+)?['′\s]*([0-9.]+)?["″\s]*([NSEW])?/i;
  const match = dms.match(regex);
  if (!match) return NaN;
  let deg = parseFloat(match[1] || 0);
  let min = parseFloat(match[2] || 0);
  let sec = parseFloat(match[3] || 0);
  let dir = match[4] || '';
  let dec = deg + min / 60 + sec / 3600;
  if (dir.toUpperCase() === 'S' || dir.toUpperCase() === 'W') dec *= -1;
  return dec;
}

export default function EditListingPage() {
  const [form, setForm] = useState(initialState);
  const [Images, setImages] = useState([]);
  const [ImgPreviews, setImgPreviews] = useState([]);
  const [avatarImg, setAvatarImg] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ isVisible: false, message: '', type: 'success' });
  const router = useRouter();
  const params = useParams();
  const listingId = params?.id;

  // Fetch listing details on mount
  useEffect(() => {
    if (!listingId) return;
    async function fetchListing() {
      try {
        const res = await fetch(`${API_URL}/${listingId}`);
        if (!res.ok) throw new Error("Failed to fetch listing");
        const data = await res.json();
        setForm({
          ...data,
          description: data.description?.main || "",
          host: {
            name: data.host?.name || "",
            yearsHosting: data.host?.yearsHosting || 1,
            avatar: data.host?.avatar || ""
          },
          coordinates: data.coordinates || { long: 0, lat: 0 },
        });
        setImgPreviews(data.images || []);
      } catch (err) {
        showSnackbar(err.message || "Failed to load listing", "error");
      }
    }
    fetchListing();
  }, [listingId]);

  const handleExtraImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length !== 5) {
      showSnackbar("Please select exactly 5 images.", "error");
      setImages([]);
      setImgPreviews([]);
      e.target.value = "";
    } else {
      setImages(files);
      setImgPreviews(files.map(file => URL.createObjectURL(file)));
      if (snackbar.message === "Please select exactly 5 images.") {
        setSnackbar({ isVisible: false, message: '', type: 'success' });
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (name.startsWith("host.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({ ...prev, host: { ...prev.host, [key]: type === "number" ? Number(value) : value } }));
    } else if (name.startsWith("coordinates.")) {
      const key = name.split(".")[1];
      let num = Number(value);
      if (isNaN(num)) {
        // Try to parse DMS format
        num = dmsToDecimal(value);
      }
      setForm((prev) => ({ ...prev, coordinates: { ...prev.coordinates, [key]: num } }));
    } else {
      setForm((prev) => ({ ...prev, [name]: type === "number" ? Number(value) : value }));
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarImg(file);
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarUploading(true);
    try {
      const url = await uploadImage(file);
      setForm((prev) => ({ ...prev, host: { ...prev.host, avatar: url } }));
    } catch (err) {
      showSnackbar(err.message || "Avatar upload failed", "error");
      setForm((prev) => ({ ...prev, host: { ...prev.host, avatar: "" } }));
      setAvatarImg(null);
      setAvatarPreview("");
    } finally {
      setAvatarUploading(false);
    }
  };

  const showSnackbar = (message, type = 'success') => {
    setSnackbar({ isVisible: true, message, type });
  };

  const hideSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, isVisible: false }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let imageUrls = ImgPreviews;
      if (Images.length === 5) {
        imageUrls = await Promise.all(Images.map(img => uploadImage(img)));
      }
      const payload = {
        ...form,
        title: String(form.title),
        location: String(form.location),
        city: String(form.city),
        description: String(form.description),
        host: {
          name: String(form.host.name),
          yearsHosting: Number(form.host.yearsHosting),
          avatar: String(form.host.avatar)
        },
        price: Number(form.price),
        currency: String(form.currency),
        coordinates: {
          long: Number(form.coordinates.long),
          lat: Number(form.coordinates.lat)
        },
        images: imageUrls
      };
      const res = await fetch(`${API_URL}/${listingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update listing");
      showSnackbar("Listing updated successfully!", "success");
      setTimeout(() => router.push("/dashboard"), 1200);
    } catch (err) {
      showSnackbar(err.message || "Something went wrong", "error");
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/${listingId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete listing");
      showSnackbar("Listing deleted successfully!", "success");
      setTimeout(() => router.push("/dashboard"), 1200);
    } catch (err) {
      showSnackbar(err.message || "Something went wrong", "error");
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Snackbar
        message={snackbar.message}
        type={snackbar.type}
        isVisible={snackbar.isVisible}
        onClose={hideSnackbar}
        duration={4000}
      />
      <div className="text-center mb-8 mt-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Edit Listing</h2>
      </div>
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <form onSubmit={handleUpdate} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter listing title..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Enter city..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Location *</label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Enter location..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                required
              />
            </div>
            <div className="flex flex-col col-span-2 md:flex-row gap-4 w-full">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Bedrooms *</label>
                <input
                  type="number"
                  name="bedrooms"
                  min="1"
                  value={form.bedrooms}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Beds *</label>
                <input
                  type="number"
                  name="beds"
                  min="1"
                  value={form.beds}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Bathrooms *</label>
                <input
                  type="number"
                  name="bathrooms"
                  min="1"
                  value={form.bathrooms}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  required
                />
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Images</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {ImgPreviews.length > 0 && ImgPreviews.map((src, idx) => (
                <div key={idx} className="relative">
                  <img src={src} alt={`Preview ${idx + 1}`} className="w-full h-32 object-cover rounded border" />
                </div>
              ))}
              <div className="relative">
                <input
                  type="file"
                  id="additionalImages"
                  multiple
                  onChange={handleExtraImages}
                  className="hidden"
                />
                <label
                  htmlFor="additionalImages"
                  className="flex flex-col items-center justify-center h-32 w-full border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                >
                  <span className="text-sm text-center text-gray-600">
                    Click to upload 5 images
                  </span>
                </label>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
            <textarea
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your property..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 resize-none"
              required
            ></textarea>
          </div>
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Host Info</h3>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Host Avatar</label>
              <div className="flex items-center gap-4">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar Preview" className="w-16 h-16 rounded-full object-cover border" />
                ) : form.host.avatar ? (
                  <img src={form.host.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover border" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 border">
                    <span className="text-2xl">+</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  id="hostAvatar"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={avatarUploading}
                />
                <label
                  htmlFor="hostAvatar"
                  className={`px-4 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer hover:bg-indigo-700 transition-colors duration-200 ${avatarUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {avatarUploading ? 'Uploading...' : 'Upload Avatar'}
                </label>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Host Name *</label>
                <input
                  type="text"
                  name="host.name"
                  value={form.host.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Years Hosting *</label>
                <input
                  type="number"
                  name="host.yearsHosting"
                  min="0"
                  value={form.host.yearsHosting}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  required
                />
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price *</label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  value={form.price}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Currency *</label>
                <input
                  type="text"
                  name="currency"
                  value={form.currency}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  required
                />
              </div>
              <div className="flex gap-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Longitude *</label>
                  <input
                    type="text"
                    name="coordinates.long"
                    value={form.coordinates.long}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Latitude *</label>
                  <input
                    type="text"
                    name="coordinates.lat"
                    value={form.coordinates.lat}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6 flex justify-between">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <span>Update Listing</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete Listing
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 