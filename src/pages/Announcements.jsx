import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
void motion;
import {
  Menu,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Loader2,
  Megaphone,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import MobileBottomNav from "../components/MobileBottomNav";
import { announcementAPI } from "../services/api";
import { saveToHistory } from "../utils/history";

const Announcements = () => {
  const userRole = localStorage.getItem("userRole")?.toLowerCase().trim();
  const userName = localStorage.getItem("userName") || "Admin";
  const isEditable = userRole === "admin" || userRole === "council";
  const isAdmin = userRole === "admin";

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", message: "" });
  const [editingId, setEditingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const loadAnnouncements = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await announcementAPI.getAll();
      setAnnouncements(res?.data || res || []);
    } catch (err) {
      setError(err.message || "Failed to load announcements");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (announcement) => {
    setFormData({ title: announcement.title, message: announcement.content });
    setEditingId(announcement.id);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ title: "", message: "" });
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.message) {
      setError("Please provide both a title and message.");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const dateStr = new Date().toISOString().split("T")[0];
      if (editingId) {
        await announcementAPI.update(
          editingId,
          formData.title,
          formData.message,
          dateStr,
        );
        saveToHistory("announcement", "updated", `Updated: ${formData.title}`);
      } else {
        await announcementAPI.create(formData.title, formData.message, dateStr);
        saveToHistory("announcement", "added", `Added: ${formData.title}`);
      }
      setFormData({ title: "", message: "" });
      setEditingId(null);
      setShowForm(false);
      await loadAnnouncements();
      showSuccess(
        editingId ? "✅ Announcement updated!" : "✅ Announcement added!",
      );
    } catch (err) {
      setError(err.message || "Failed to save announcement.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setError(null);
    try {
      await announcementAPI.delete(id);
      saveToHistory("announcement", "deleted", "Removed an announcement");
      setDeleteConfirmId(null);
      await loadAnnouncements();
      showSuccess("✅ Announcement deleted.");
    } catch (err) {
      setError(err.message || "Failed to delete announcement.");
    }
  };

  const filtered = announcements.filter(
    (a) =>
      a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className="flex-1 lg:ml-[250px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-gray-400">
            <Loader2 className="animate-spin text-amber-500" size={44} />
            <p className="text-sm font-medium">Loading announcements...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 lg:ml-[250px] pb-24 lg:pb-8 min-w-0">
        {/* ── Mobile Header ──────────────────────────────────────────────── */}
        <header className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-gray-100 h-16 flex items-center justify-between px-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Menu size={24} className="text-gray-600" />
          </button>
          <span className="font-bold text-amber-600 text-lg">
            Announcements
          </span>
          <div className="w-9 h-9 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {userName[0]?.toUpperCase()}
          </div>
        </header>

        <div className="px-4 lg:px-8 py-6 max-w-4xl mx-auto space-y-6">
          {/* ── Banner ─────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl overflow-hidden bg-gradient-to-r from-amber-600 to-orange-600 p-8 text-center text-white"
          >
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Megaphone size={24} />
            </div>
            <h1 className="text-2xl font-bold mb-1">Announcements</h1>
            <p className="text-white/75 text-sm">
              Stay updated with church news
            </p>

            {/* Search */}
            <div className="mt-5 max-w-md mx-auto relative">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search announcements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-gray-700 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>

            <div className="mt-6 text-center lg:text-left">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-amber-600 font-semibold hover:text-amber-700 transition"
              >
                ← Back to Home
              </Link>
            </div>
          </motion.div>

          {/* ── Alerts ─────────────────────────────────────────────────── */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-2 text-red-700 text-sm">
                  <AlertCircle size={16} />
                  {error}
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-600"
                >
                  <X size={16} />
                </button>
              </motion.div>
            )}
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 text-sm font-medium"
              >
                {successMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Action Row ─────────────────────────────────────────────── */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">
              {filtered.length} announcement{filtered.length !== 1 ? "s" : ""}
            </p>
            <div className="flex gap-2">
              <button
                onClick={loadAnnouncements}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-sm font-medium transition-all"
              >
                <RefreshCw size={14} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              {isEditable && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setEditingId(null);
                    setFormData({ title: "", message: "" });
                    setShowForm(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-all shadow-lg shadow-amber-100"
                >
                  <Plus size={16} />
                  Add Announcement
                </motion.button>
              )}
            </div>
          </div>

          {/* ── Empty State ────────────────────────────────────────────── */}
          {filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center"
            >
              <Megaphone size={56} className="text-gray-200 mx-auto mb-4" />
              <h3 className="font-bold text-gray-700 text-lg mb-2">
                {searchQuery
                  ? `No results for "${searchQuery}"`
                  : "No announcements yet"}
              </h3>
              <p className="text-gray-400 text-sm">
                {searchQuery
                  ? "Try a different search term"
                  : "Check back later for updates"}
              </p>
            </motion.div>
          )}

          {/* ── Announcements List ─────────────────────────────────────── */}
          <div className="space-y-4">
            <AnimatePresence>
              {filtered.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Amber left accent */}
                  <div className="flex">
                    <div className="w-1 bg-amber-400 shrink-0" />

                    <div className="flex-1 p-5">
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2">
                            <Megaphone size={10} /> General
                          </span>
                          <h2 className="font-bold text-gray-900 text-base leading-snug">
                            {item.title}
                          </h2>
                        </div>
                        <span className="text-xs text-gray-400 shrink-0 mt-1">
                          {formatDate(item.date)}
                        </span>
                      </div>

                      {/* Content preview */}
                      <p
                        className={`text-gray-500 text-sm leading-relaxed ${expandedId === item.id ? "" : "line-clamp-3"}`}
                      >
                        {item.content}
                      </p>

                      {/* Expanded full content */}
                      <AnimatePresence>
                        {expandedId === item.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                          />
                        )}
                      </AnimatePresence>

                      {/* Bottom row */}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                        {/* Author */}
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-xs font-bold">
                            {getInitials(item.created_by_name)}
                          </div>
                          <span className="text-xs text-gray-400">
                            {item.created_by_name || "Admin"}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              setExpandedId(
                                expandedId === item.id ? null : item.id,
                              )
                            }
                            className="flex items-center gap-1 text-amber-600 text-xs font-semibold hover:text-amber-700 transition-colors"
                          >
                            {expandedId === item.id ? (
                              <>
                                <ChevronUp size={14} /> Read Less
                              </>
                            ) : (
                              <>
                                <ChevronDown size={14} /> Read More
                              </>
                            )}
                          </button>

                          {isEditable && (
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                            >
                              <Edit2 size={15} />
                            </button>
                          )}

                          {isAdmin && (
                            <button
                              onClick={() => setDeleteConfirmId(item.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* ── Mobile FAB ─────────────────────────────────────────────── */}
          {isEditable && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setEditingId(null);
                setFormData({ title: "", message: "" });
                setShowForm(true);
              }}
              className="lg:hidden fixed bottom-24 right-4 z-40 w-14 h-14 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-xl flex items-center justify-center"
            >
              <Plus size={24} />
            </motion.button>
          )}
        </div>
      </main>

      {/* ── Add/Edit Modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) handleCancelEdit();
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="font-bold text-xl text-gray-900">
                  {editingId ? "Edit Announcement" : "New Announcement"}
                </h2>
                <button
                  onClick={handleCancelEdit}
                  className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    name="title"
                    placeholder="Enter announcement title"
                    value={formData.title}
                    onChange={handleChange}
                    disabled={isSaving}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none text-sm disabled:bg-gray-50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    placeholder="Enter announcement message..."
                    value={formData.message}
                    onChange={handleChange}
                    disabled={isSaving}
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none text-sm resize-none disabled:bg-gray-50 transition-all"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                    <AlertCircle size={15} /> {error}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 px-6 pb-6">
                <button
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSubmit}
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm flex items-center gap-2 disabled:opacity-60 transition-all shadow-lg shadow-amber-100"
                >
                  {isSaving && <Loader2 size={15} className="animate-spin" />}
                  {isSaving ? "Saving..." : editingId ? "Update" : "Save"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete Confirm Modal ───────────────────────────────────────── */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center"
            >
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">
                Delete Announcement?
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="flex-1 px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <MobileBottomNav onOpenSidebar={() => setIsSidebarOpen(true)} />
    </div>
  );
};

export default Announcements;
