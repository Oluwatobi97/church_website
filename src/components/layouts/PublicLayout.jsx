import { useState, useEffect } from "react";
import { NavLink, Link, useNavigate, Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Devotion", to: "/devotion" },
  { label: "Announcements", to: "/announcements" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

const PublicNavbar = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const isLoggedIn = Boolean(localStorage.getItem("accessToken"));

  useEffect(() => {
    const handleScroll = () => setHasScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavigate = (to) => {
    navigate(to);
    setShowMenu(false);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        hasScrolled
          ? "bg-white shadow-md text-gray-800"
          : "bg-transparent text-white"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => handleNavigate("/")}
          className="font-bold text-emerald-700 text-xl tracking-tight"
        >
          Church
        </button>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? "text-emerald-700" : "hover:text-emerald-500"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(isLoggedIn ? "/dashboard" : "/login")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              hasScrolled
                ? "bg-emerald-600 text-white"
                : "bg-emerald-500 text-white"
            }`}
          >
            {isLoggedIn ? "Go to Dashboard" : "Login"}
          </button>

          <button
            type="button"
            onClick={() => setShowMenu((current) => !current)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white shadow-lg shadow-black/10 transition hover:bg-white/20 md:hidden"
            aria-label="Toggle navigation"
          >
            {showMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="border-t border-white/20 bg-white/95 text-gray-800 md:hidden"
          >
            <div className="space-y-2 px-4 py-4">
              {navLinks.map((link) => (
                <button
                  key={link.to}
                  type="button"
                  onClick={() => handleNavigate(link.to)}
                  className="block w-full rounded-2xl px-4 py-3 text-left text-sm font-medium hover:bg-emerald-50"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const PublicFooter = () => (
  <footer className="mt-16 bg-emerald-900 text-white">
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:px-8 lg:grid-cols-3">
      <div className="space-y-3">
        <h2 className="text-xl font-bold">Church</h2>
        <p className="max-w-sm text-sm text-emerald-100/90">
          Building community, sharing faith, and serving together with
          compassion.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-200">
          Quick Links
        </h3>
        <div className="space-y-2 text-sm text-emerald-100/90">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} className="block hover:text-white">
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-200">
          Service Times
        </h3>
        <div className="space-y-2 text-sm text-emerald-100/90">
          <p>Sunday Worship: 9:00 AM</p>
          <p>Midweek Prayer: Wednesday 6:00 PM</p>
          <p>Bible Study: Friday 7:00 PM</p>
        </div>
      </div>
    </div>
    <div className="border-t border-white/10 px-4 py-4 text-center text-sm text-emerald-100/80 sm:px-6 lg:px-8">
      © {new Date().getFullYear()} Church. All rights reserved.
    </div>
  </footer>
);

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      <main className="pt-16">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
};

export default PublicLayout;
