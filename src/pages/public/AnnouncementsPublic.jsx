import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { announcementAPI } from "../../services/api";

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

const AnnouncementsPublic = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const isLoggedIn = Boolean(localStorage.getItem("accessToken"));

  useEffect(() => {
    let isMounted = true;
    const loadAnnouncements = async () => {
      setIsLoading(true);
      setHasError(false);
      try {
        const response = await announcementAPI.getAll();
        if (!isMounted) return;
        setAnnouncements(response?.data || response || []);
      } catch (error) {
        if (!isMounted) return;
        setHasError(true);
      } finally {
        if (!isMounted) return;
        setIsLoading(false);
      }
    };
    loadAnnouncements();
    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = announcements.filter((item) =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="pt-8 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-amber-600 to-orange-500 p-10 text-white shadow-xl overflow-hidden relative">
          <div className="absolute bottom-0 right-0 opacity-10">
            <span className="text-[180px]">📢</span>
          </div>
          <div className="relative z-10 space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold">Announcements</h1>
            <p className="max-w-2xl text-sm text-amber-100/90 sm:text-base">
              Receive the latest church announcements, schedules, and community
              updates.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-200"
                />
                <input
                  type="text"
                  aria-label="Search announcements"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search announcements..."
                  className="w-full rounded-2xl border border-white/20 bg-white/10 py-3 pl-12 pr-4 text-sm text-white placeholder-amber-200 outline-none transition focus:border-white"
                />
              </div>
              {isLoggedIn && (
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="inline-flex items-center justify-center rounded-full bg-amber-100 px-5 py-3 text-sm font-semibold text-amber-900 transition hover:bg-amber-200"
                >
                  Dashboard →
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {isLoggedIn && (
            <div className="rounded-3xl border border-amber-100 bg-amber-50 p-5 text-amber-900 shadow-sm">
              <p className="font-semibold">Welcome back!</p>
              <p className="mt-1 text-sm text-amber-700">
                Go to Dashboard to manage announcements.
              </p>
            </div>
          )}

          {isLoading ? (
            <div className="mt-10 flex min-h-[320px] items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-gray-500">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />
                <p>Loading announcements...</p>
              </div>
            </div>
          ) : filtered.length > 0 ? (
            <div className="space-y-6">
              {filtered.map((item) => {
                const expanded = expandedId === item.id;
                return (
                  <article
                    key={item.id}
                    className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
                  >
                    <div className="border-l-4 border-amber-400 p-6">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800">
                          📢 General
                        </span>
                        <span className="text-sm text-gray-400">
                          {formatDate(item.date)}
                        </span>
                      </div>
                      <h2 className="mt-5 text-xl font-bold text-gray-900">
                        {item.title}
                      </h2>
                      <div
                        className={`mt-4 text-sm leading-6 text-gray-600 ${expanded ? "max-h-full" : "max-h-20 overflow-hidden"}`}
                      >
                        <p className="whitespace-pre-wrap">{item.content}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setExpandedId(expanded ? null : item.id)}
                        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-amber-600"
                      >
                        {expanded ? "Read Less" : "Read More"}
                      </button>
                    </div>
                    <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 font-bold">
                          {item.created_by_name?.[0]?.toUpperCase() || "A"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {item.created_by_name || "Church Admin"}
                          </p>
                          <p className="text-xs text-gray-500">Author</p>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-10 rounded-3xl border border-amber-100 bg-amber-50 p-10 text-center text-amber-900 shadow-sm">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-white text-4xl">
                📣
              </div>
              <h2 className="text-2xl font-bold">No announcements yet</h2>
              <p className="mt-3 text-sm text-amber-700/90">
                The announcements feed is empty right now. Check back soon for
                updates.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementsPublic;
