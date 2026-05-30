import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
void motion;
import {
  Menu,
  Plus,
  X,
  Search,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
  BookOpen,
  LogIn,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import MobileBottomNav from "../components/MobileBottomNav";
import { saveToHistory } from "../utils/helpers.js";

const buildDevotion = (formData, userName) => ({
  ...formData,
  id: `devotion-${Math.random().toString(36).slice(2, 10)}`,
  created_by_name: userName,
});

// Public Navbar (declared outside component to avoid recreation during render)
const PublicNav = ({ navigate }) => (
  <nav className="h-16 bg-white border-b border-gray-100 px-4 flex items-center justify-between sticky top-0 z-50">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
        <BookOpen size={20} />
      </div>
      <span className="font-bold text-gray-900 text-lg tracking-tight">
        Church<span className="text-emerald-600">Connect</span>
      </span>
    </div>
    <button
      onClick={() => navigate("/login")}
      className="flex items-center gap-2 text-emerald-600 font-bold hover:bg-emerald-50 px-4 py-2 rounded-xl transition-all"
    >
      <LogIn size={18} />
      Login
    </button>
  </nav>
);

const Devotion = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole")?.toLowerCase();
  const isLoggedIn = !!localStorage.getItem("accessToken");
  const isAdmin = userRole === "admin";
  const showSidebar = isLoggedIn && isAdmin;
  const isEditable = userRole === "admin" || userRole === "council";
  const userName = localStorage.getItem("userName") || "Admin";

  // Existing State
  const [devotions, setDevotions] = useState([
    {
      id: 1,
      title: "Faith in God",
      content:
        "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight. Faith is the substance of things hoped for, the evidence of things not seen. When we walk by faith, we allow God to take the lead in our lives, knowing that His plans are always better than ours.",
      date: "2025-05-10",
      created_by_name: "Pastor Samuel",
    },
  ]);

  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    date: new Date().toISOString().split("T")[0],
  });

  // Existing Handlers
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAdd = () => {
    if (isEditing) {
      setDevotions(
        devotions.map((d) => (d.id === isEditing ? { ...d, ...formData } : d)),
      );
      saveToHistory("Devotion", "edited", `Edited devotion: ${formData.title}`);
    } else {
      const newDevotion = buildDevotion(formData, userName);
      setDevotions([newDevotion, ...devotions]);
      saveToHistory("Devotion", "added", `Added devotion: ${formData.title}`);
    }
    setFormData({
      title: "",
      content: "",
      date: new Date().toISOString().split("T")[0],
    });
    setShowForm(false);
    setIsEditing(null);
  };

  const handleDelete = (id) => {
    const updated = devotions.filter((d) => d.id !== id);
    setDevotions(updated);
    saveToHistory("Devotion", "deleted", "Removed a devotion entry");
    setShowDeleteConfirm(null);
  };

  const openEdit = (devotion) => {
    setFormData({
      title: devotion.title,
      content: devotion.content,
      date: devotion.date,
    });
    setIsEditing(devotion.id);
    setShowForm(true);
  };

  const filteredDevotions = devotions.filter(
    (d) =>
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.content.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {showSidebar && (
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      )}

      <main
        className={`flex-1 ${showSidebar ? "lg:ml-[250px]" : ""} pb-24 lg:pb-8 min-w-0`}
      >
        {showSidebar ? (
          <header className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-gray-100 h-16 flex items-center justify-between px-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-xl hover:bg-gray-100"
            >
              <Menu size={24} className="text-gray-600" />
            </button>
            <span className="font-bold text-emerald-700 text-lg">Devotion</span>
            <div className="flex items-center gap-2">
              <Link
                to="/"
                className="inline-flex h-9 items-center justify-center rounded-xl border border-emerald-200 bg-white px-3 text-sm font-semibold text-emerald-700 shadow-sm hover:bg-emerald-50 transition"
              >
                Home
              </Link>
              <div className="w-9 h-9 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {userName[0]?.toUpperCase()}
              </div>
            </div>
          </header>
        ) : isLoggedIn ? (
          <header className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-gray-100 h-16 flex items-center justify-between px-4">
            <span className="font-bold text-emerald-700 text-lg">Devotion</span>
            <Link
              to="/"
              className="inline-flex h-9 items-center justify-center rounded-xl border border-emerald-200 bg-white px-3 text-sm font-semibold text-emerald-700 shadow-sm hover:bg-emerald-50 transition"
            >
              Home
            </Link>
          </header>
        ) : (
          <PublicNav navigate={navigate} />
        )}

        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 py-12 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <BookOpen
              size={200}
              className="absolute -right-10 -bottom-10 rotate-12"
            />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Daily Devotion
            </h1>
            <p className="text-emerald-100/70 font-medium">
              Daily spiritual nourishment for your soul
            </p>
          </motion.div>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mt-8 relative z-10">
            <div className="relative group">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors"
                size={20}
              />
              <input
                type="text"
                placeholder="Search devotions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white shadow-xl border-none focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-gray-700"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-center lg:justify-start">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-5 py-3 text-sm font-semibold text-emerald-800 shadow-lg shadow-emerald-200/30 hover:bg-white transition"
            >
              ← Back to Home
            </Link>
          </div>

          {isEditable && (
            <button
              onClick={() => {
                setIsEditing(null);
                setFormData({
                  title: "",
                  content: "",
                  date: new Date().toISOString().split("T")[0],
                });
                setShowForm(true);
              }}
              className="hidden lg:flex absolute top-8 right-8 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-5 py-2.5 rounded-xl font-bold items-center gap-2 transition-all"
            >
              <Plus size={20} /> Add Devotion
            </button>
          )}
        </div>

        <div className="px-4 lg:px-8 py-8 max-w-7xl mx-auto">
          {filteredDevotions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDevotions.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group relative"
                >
                  <div className="h-1 bg-gradient-to-r from-emerald-500 to-emerald-600" />

                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5">
                        <Calendar size={14} />
                        {new Date(item.date).toLocaleDateString()}
                      </div>
                      {isEditable && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => openEdit(item)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(item.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mb-3 leading-tight line-clamp-2">
                      {item.title}
                    </h2>

                    <div className="text-gray-500 text-sm leading-relaxed mb-4">
                      <AnimatePresence initial={false}>
                        {expandedId === item.id ? (
                          <motion.p
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            {item.content}
                          </motion.p>
                        ) : (
                          <p className="line-clamp-3">{item.content}</p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-xs">
                        {item.created_by_name?.charAt(0) || "P"}
                      </div>
                      <span className="text-xs font-bold text-gray-700">
                        {item.created_by_name}
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        setExpandedId(expandedId === item.id ? null : item.id)
                      }
                      className="text-emerald-600 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      {expandedId === item.id ? "Read Less" : "Read More"}
                      {expandedId === item.id ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 mb-4">
                <BookOpen size={48} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                No devotions yet
              </h3>
              <p className="text-gray-500 max-w-xs mx-auto mt-2">
                Check back later or help us add the first spiritual nourishment
                for the day.
              </p>
              {isEditable && (
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-6 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-100 flex items-center gap-2 transition-all"
                >
                  <Plus size={20} /> Add the first devotion
                </button>
              )}
            </div>
          )}
        </div>

        {/* Admin FAB for Mobile */}
        {isEditable && isLoggedIn && (
          <button
            onClick={() => {
              setIsEditing(null);
              setFormData({
                title: "",
                content: "",
                date: new Date().toISOString().split("T")[0],
              });
              setShowForm(true);
            }}
            className="lg:hidden fixed bottom-24 right-4 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center z-40 active:scale-90 transition-transform"
          >
            <Plus size={28} />
          </button>
        )}

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {showForm && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowForm(false)}
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-emerald-600 text-white">
                  <h2 className="text-xl font-bold">
                    {isEditing ? "Edit Devotion" : "Add New Devotion"}
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                      Title
                    </label>
                    <input
                      name="title"
                      value={formData.title}
                      placeholder="Devotion Title"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-semibold"
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                      Date
                    </label>
                    <div className="relative">
                      <Calendar
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        name="date"
                        type="date"
                        value={formData.date}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-semibold"
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                      Content
                    </label>
                    <textarea
                      name="content"
                      rows="8"
                      value={formData.content}
                      placeholder="Share the word..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none leading-relaxed"
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="p-6 border-t border-gray-100 flex items-center gap-3">
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAdd}
                    className="flex-[2] bg-emerald-600 text-white px-4 py-3 rounded-xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-[0.98]"
                  >
                    {isEditing ? "Update Devotion" : "Publish Devotion"}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowDeleteConfirm(null)}
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-white p-6 rounded-3xl shadow-2xl max-w-sm w-full text-center"
              >
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Are you sure?
                </h3>
                <p className="text-gray-500 mb-6">
                  This action cannot be undone. This devotion will be
                  permanently removed.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(showDeleteConfirm)}
                    className="flex-1 bg-red-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-red-700 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      {showSidebar && (
        <MobileBottomNav onOpenSidebar={() => setIsSidebarOpen(true)} />
      )}
    </div>
  );
};

export default Devotion;
