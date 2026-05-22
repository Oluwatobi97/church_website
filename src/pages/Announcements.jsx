import Sidebar from "../components/Sidebar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { saveToHistory } from "../utils/history";
import { announcementAPI } from "../services/api";
import { Loader2 } from "lucide-react";

const Announcements = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole")?.toLowerCase().trim();

  // Permissions logic
  const isEditable = userRole === "admin" || userRole === "council";
  const isAdmin = userRole === "admin";

  const [announcements, setAnnouncements] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", message: "" });
  const [editingId, setEditingId] = useState(null); // To track which announcement is being edited

  // UI & API States
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // 2. On page load call announcementAPI.getAll() to fetch all announcements from backend
  const loadAnnouncements = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await announcementAPI.getAll();
      // Adjust based on your API response structure (e.g., res.data or res)
      setAnnouncements(res?.data || res || []);
    } catch (err) {
      setError(err.message || "Failed to load announcements. Please refresh.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEdit = (announcement) => {
    setFormData({ title: announcement.title, message: announcement.content }); // Assuming content is the message field
    setEditingId(announcement.id);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ title: "", message: "" });
    setShowForm(false);
  };

  // 3 & 4. When admin/council submits new/edits announcement
  const handleSubmit = async () => {
    if (!formData.title || !formData.message) {
      alert("Please provide both a title and message.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const dateStr = new Date().toISOString().split("T")[0];

      if (editingId) {
        // Update existing
        await announcementAPI.update(
          editingId,
          formData.title,
          formData.message,
          dateStr,
        );
        saveToHistory("announcement", "updated", `Updated: ${formData.title}`);
      } else {
        // Create new
        await announcementAPI.create(formData.title, formData.message, dateStr);
        saveToHistory("announcement", "added", `Added: ${formData.title}`);
      }

      // Success steps
      setFormData({ title: "", message: "" });
      setEditingId(null);
      setShowForm(false);
      await loadAnnouncements(); // Refresh list
      alert(
        editingId
          ? "Announcement updated successfully! ✅"
          : "Announcement added successfully! ✅",
      );
    } catch (err) {
      setError(err.message || "Failed to save announcement.");
    } finally {
      setIsSaving(false);
    }
  };

  // 5. When admin deletes an announcement
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?"))
      return;

    setError(null);
    try {
      await announcementAPI.delete(id);
      saveToHistory(
        "announcement",
        "deleted",
        "Removed an announcement from the system",
      );
      await loadAnnouncements(); // Refresh list
      alert("Announcement deleted successfully! 🗑️");
    } catch (err) {
      setError(err.message || "Failed to delete announcement.");
    }
  };

  // 6. Add loading state while fetching
  if (isLoading) {
    return (
      <div className="flex bg-gray-100 min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-gray-500">
            <Loader2 className="animate-spin" size={36} />
            <p className="text-sm">Fetching announcements...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="p-6 w-full">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Announcements</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-gray-600 text-white px-4 py-2 rounded"
          >
            Dashboard
          </button>
        </div>

        {/* 7. Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm flex justify-between">
            <span>❌ {error}</span>
            <button onClick={() => setError(null)} className="underline">
              Dismiss
            </button>
          </div>
        )}

        {isEditable && (
          <button
            onClick={() => {
              setEditingId(null); // Clear editing state for new announcement
              setFormData({ title: "", message: "" });
              setShowForm(true);
            }}
            className="mb-4 bg-green-500 text-white px-4 py-2 rounded"
          >
            + Add Announcement
          </button>
        )}

        {announcements.length === 0 ? (
          <div className="bg-white p-10 text-center rounded shadow text-gray-400">
            No announcements found.
          </div>
        ) : (
          announcements.map((item) => (
            <div key={item.id} className="bg-white p-4 mb-3 rounded shadow">
              <h2 className="font-bold">{item.title}</h2>
              <p>{item.content}</p>{" "}
              {/* Assuming 'content' is the message field from API */}
              <p className="text-xs text-gray-500 mt-1">
                {item.date} by {item.created_by_name}
              </p>
              <div className="flex gap-4 mt-2 text-sm">
                {isEditable && (
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-blue-500 hover:underline"
                  >
                    Edit
                  </button>
                )}
                {isAdmin && ( // Only Admin can delete
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-5 rounded w-96 shadow-2xl">
              <h2 className="mb-3 font-bold text-lg">
                {editingId ? "Edit Announcement" : "Add New Announcement"}
              </h2>

              <input
                name="title"
                placeholder="Title"
                className="w-full mb-2 p-2 border"
                onChange={handleChange}
                value={formData.title}
                disabled={isSaving}
              />

              <textarea
                name="message"
                placeholder="Message"
                className="w-full mb-4 p-2 border h-32"
                onChange={handleChange}
                value={formData.message}
                disabled={isSaving}
              />

              <div className="flex justify-between">
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSaving}
                  className="bg-green-500 text-white px-6 py-2 rounded flex items-center gap-2 hover:bg-green-600 disabled:opacity-50 transition-colors"
                >
                  {isSaving && <Loader2 className="animate-spin" size={16} />}
                  {isSaving ? "Saving..." : editingId ? "Update" : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;
