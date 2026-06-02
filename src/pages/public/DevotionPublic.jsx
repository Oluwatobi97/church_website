import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BookOpen, Search, ChevronDown, ChevronUp } from "lucide-react";
import { devotionAPI } from "../../services/api";

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const DevotionPublic = () => {
  const navigate = useNavigate();
  const [devotions, setDevotions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const isLoggedIn = Boolean(localStorage.getItem("accessToken"));

  useEffect(() => {
    let isMounted = true;
    const loadDevotions = async () => {
      setIsLoading(true);
      setHasError(false);
      try {
        const response = await devotionAPI.getAll();
        if (!isMounted) return;
        setDevotions(response?.data || response || []);
      } catch (error) {
        if (!isMounted) return;
        setHasError(true);
      } finally {
        if (!isMounted) return;
        setIsLoading(false);
      }
    };
    loadDevotions();
    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = devotions.filter((item) =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const toggleExpand = (id) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  return (
    <div className="pt-8 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-emerald-700 to-emerald-900 p-10 text-white shadow-xl overflow-hidden relative">
          <div className="absolute right-0 top-0 opacity-10">
            <BookOpen size={220} />
          </div>
          <div className="relative z-10 space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold">Daily Devotion</h1>
            <p className="max-w-2xl text-sm text-emerald-100/90 sm:text-base">
              Quiet your heart with scripture, reflection, and encouragement for
              every day.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-200"
                  />
                  <input
                    type="text"
                    aria-label="Search devotions"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search devotions..."
                    className="w-full rounded-2xl border border-white/20 bg-white/10 py-3 pl-12 pr-4 text-sm text-white placeholder-emerald-200 outline-none transition focus:border-white"
                  />
                </div>
              </div>
              {isLoggedIn && (
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-100 px-5 py-3 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-200"
                >
                  Dashboard →
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8">
          {isLoggedIn && (
            <div className="rounded-3xl border border-emerald-100/60 bg-emerald-50 p-5 text-emerald-900 shadow-sm">
              <p className="font-semibold">Welcome back!</p>
              <p className="mt-1 text-sm text-emerald-700">
                Go to Dashboard to manage devotions.
              </p>
            </div>
          )}

          {isLoading ? (
            <div className="mt-10 flex min-h-[320px] items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-gray-500">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-700" />
                <p>Loading devotions...</p>
              </div>
            </div>
          ) : filtered.length > 0 ? (
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((item) => {
                const expanded = expandedId === item.id;
                return (
                  <motion.article
                    key={item.id}
                    layout
                    className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
                  >
                    <div className="h-2 bg-emerald-500" />
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <span className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                          Devotion
                        </span>
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                          {formatDate(item.date)}
                        </span>
                      </div>
                      <h2 className="mt-5 text-xl font-bold text-gray-900">
                        {item.title}
                      </h2>
                      <div className="mt-4 text-sm leading-6 text-gray-600">
                        <div
                          className={`${expanded ? "max-h-full" : "max-h-20 overflow-hidden"}`}
                        >
                          <p className="whitespace-pre-wrap">{item.content}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleExpand(item.id)}
                        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700"
                      >
                        {expanded ? "Read Less" : "Read More"}
                        {expanded ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </button>
                    </div>
                    <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 font-bold">
                          {item.created_by_name?.[0]?.toUpperCase() || "A"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {item.created_by_name || "Church Leader"}
                          </p>
                          <p className="text-xs text-gray-500">Author</p>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          ) : (
            <div className="mt-10 rounded-3xl border border-emerald-100 bg-emerald-50 p-10 text-center text-emerald-900 shadow-sm">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-white text-4xl">
                📖
              </div>
              <h2 className="text-2xl font-bold">No devotions available</h2>
              <p className="mt-3 text-sm text-emerald-700/90">
                The team is preparing fresh devotion content. Check back soon.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DevotionPublic;
