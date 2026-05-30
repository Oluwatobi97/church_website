import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { devotionAPI, announcementAPI } from "../services/api";
import { Play, Menu, X, Clock, MapPin } from "lucide-react";

const Home = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [devotions, setDevotions] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loadingDevotions, setLoadingDevotions] = useState(true);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const loadDevotions = async () => {
      try {
        const response = await devotionAPI.getAll();
        if (response && Array.isArray(response)) {
          setDevotions(response.slice(0, 3));
        } else if (response && response.data) {
          setDevotions(response.data.slice(0, 3));
        }
      } catch {
        setDevotions([]);
      } finally {
        setLoadingDevotions(false);
      }
    };

    loadDevotions();
  }, []);

  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        const response = await announcementAPI.getAll();
        if (response && Array.isArray(response)) {
          setAnnouncements(response.slice(0, 3));
        } else if (response && response.data) {
          setAnnouncements(response.data.slice(0, 3));
        }
      } catch {
        setAnnouncements([]);
      } finally {
        setLoadingAnnouncements(false);
      }
    };

    loadAnnouncements();
  }, []);

  const navLinkClass = scrolled
    ? "text-gray-800 hover:text-emerald-600"
    : "text-white hover:text-emerald-200";

  return (
    <div className="bg-white">
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white text-gray-800 shadow-md"
            : "bg-transparent text-white"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="text-xl font-bold">
            Church
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={navLinkClass}>
              Home
            </Link>
            <Link to="/daily-devotion" className={navLinkClass}>
              Daily Devotion
            </Link>
            <Link to="/announcements" className={navLinkClass}>
              Announcements
            </Link>
            <Link to="/contact" className={navLinkClass}>
              Contact
            </Link>
            <Link to="/about" className={navLinkClass}>
              About
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden md:inline-flex bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition"
            >
              Login
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-lg border border-white/40 bg-white/10 text-current"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-white shadow-lg">
            <div className="flex flex-col px-6 py-4 space-y-3">
              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="text-gray-800 font-medium"
              >
                Home
              </Link>
              <Link
                to="/daily-devotion"
                onClick={() => setMenuOpen(false)}
                className="text-gray-800 font-medium"
              >
                Daily Devotion
              </Link>
              <Link
                to="/announcements"
                onClick={() => setMenuOpen(false)}
                className="text-gray-800 font-medium"
              >
                Announcements
              </Link>
              <Link
                to="/contact"
                onClick={() => setMenuOpen(false)}
                className="text-gray-800 font-medium"
              >
                Contact
              </Link>
              <Link
                to="/about"
                onClick={() => setMenuOpen(false)}
                className="text-gray-800 font-medium"
              >
                About
              </Link>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="inline-flex justify-center bg-emerald-600 text-white px-4 py-2 rounded-lg"
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </nav>

      <div className="relative h-[90vh]">
        <img
          src="https://images.unsplash.com/photo-1507692049790-de58290a4334"
          alt="Church worship"
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/80 via-emerald-800/60 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 text-white">
          <div className="mb-6 bg-white/10 p-4 rounded-full backdrop-blur-sm border border-white/20">
            <Play size={30} />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            All You Need <br /> is Living Worship
          </h1>

          <p className="max-w-2xl text-gray-200 mb-8">
            Bringing people closer to God through worship and the Word.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={() => navigate("/about")}
              className="bg-emerald-600 hover:bg-emerald-700 px-8 py-3 rounded-full text-white transition"
            >
              Learn More
            </button>
            <button
              type="button"
              onClick={() => navigate("/contact")}
              className="rounded-full border border-white text-white px-8 py-3 hover:bg-white/10 transition"
            >
              Join Us Sunday
            </button>
          </div>
        </div>
      </div>

      <main className="pt-28">
        <section className="py-20 px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            A Church that loves God and people
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We are committed to building a strong community of believers,
            growing spiritually, and spreading the love of Christ.
          </p>
        </section>

        <section className="bg-white py-16 px-6">
          <div className="max-w-7xl mx-auto grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Prayers & Worship",
                description:
                  "Experience growth and connection through worship and prayer.",
              },
              {
                title: "Bible Teaching",
                description:
                  "Grow deeper in faith through Scripture-based teaching.",
              },
              {
                title: "Community Care",
                description:
                  "Join a family that serves, supports, and encourages one another.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white shadow-md rounded-3xl p-8 text-center hover:shadow-xl transition"
              >
                <h3 className="font-bold text-xl mb-3">{item.title}</h3>
                <p className="text-gray-500">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold">Join Us</h2>
            <p className="text-gray-600 mt-3">
              Worship with us throughout the week and experience intentional
              fellowship.
            </p>
          </div>
          <div className="max-w-7xl mx-auto grid gap-6 md:grid-cols-3">
            {[
              {
                day: "Tuesday",
                time: "6:00 AM",
                programme: "Prayers",
              },
              {
                day: "Friday",
                time: "6:00 AM",
                programme: "Intercession",
              },
              {
                day: "Sunday",
                time: "9:00 AM",
                programme: "Main Service",
              },
            ].map((service) => (
              <div
                key={service.day}
                className="border border-gray-200 rounded-3xl p-6 text-center bg-white shadow-sm"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-4">
                  <Clock size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">{service.day}</h3>
                <p className="text-gray-500 mb-2">{service.time}</p>
                <p className="text-emerald-600 font-semibold">
                  {service.programme}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto text-center mb-10">
            <h2 className="text-3xl font-bold">Latest Devotions</h2>
            <p className="text-gray-500 mt-3">Daily spiritual nourishment</p>
          </div>

          <div className="max-w-7xl mx-auto grid gap-6 lg:grid-cols-3">
            {loadingDevotions
              ? Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm animate-pulse"
                  >
                    <div className="h-1 rounded-full bg-emerald-200 mb-6" />
                    <div className="h-6 w-2/3 rounded bg-gray-200 mb-4" />
                    <div className="h-4 rounded bg-gray-200 mb-3" />
                    <div className="h-4 rounded bg-gray-200 mb-3" />
                    <div className="h-4 rounded bg-gray-200" />
                  </div>
                ))
              : devotions.map((devotion) => (
                  <div
                    key={devotion.id || devotion._id || devotion.title}
                    className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
                  >
                    <div className="h-1 bg-gradient-to-r from-emerald-500 to-emerald-300" />
                    <div className="p-6">
                      <div className="flex justify-between items-start gap-4 mb-4">
                        <div className="text-sm text-emerald-700 bg-emerald-100 rounded-full px-3 py-1">
                          {new Date(
                            devotion.date || devotion.createdAt || Date.now(),
                          ).toLocaleDateString()}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {devotion.title}
                      </h3>
                      <p
                        className="text-gray-500 leading-7 mb-6"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {devotion.content}
                      </p>
                      <Link
                        to="/devotion"
                        className="text-emerald-600 font-semibold hover:text-emerald-700"
                      >
                        Read More
                      </Link>
                    </div>
                  </div>
                ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              to="/devotion"
              className="inline-flex items-center justify-center rounded-full border border-emerald-600 px-8 py-3 text-emerald-600 hover:bg-emerald-50 transition"
            >
              View All Devotions
            </Link>
          </div>
        </section>

        <section className="bg-gray-50 py-16 px-6">
          <div className="max-w-7xl mx-auto text-center mb-10">
            <h2 className="text-3xl font-bold">Announcements</h2>
            <p className="text-gray-500 mt-3">Stay updated with church news</p>
          </div>

          <div className="max-w-7xl mx-auto space-y-6">
            {loadingAnnouncements
              ? Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-3xl bg-white p-6 shadow-sm animate-pulse"
                  >
                    <div className="h-6 w-6 rounded-full bg-amber-200 mb-4" />
                    <div className="h-6 w-1/3 rounded bg-gray-200 mb-3" />
                    <div className="h-4 rounded bg-gray-200 mb-2" />
                    <div className="h-4 rounded bg-gray-200" />
                  </div>
                ))
              : announcements.map((announcement) => (
                  <div
                    key={
                      announcement.id || announcement._id || announcement.title
                    }
                    className="rounded-3xl border-l-4 border-amber-400 bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4 mb-5">
                      <div className="flex items-center gap-2 text-amber-600 text-xl">
                        <span>📢</span>
                        <span className="font-semibold">Announcement</span>
                      </div>
                      <div className="text-sm text-gray-400">
                        {new Date(
                          announcement.date ||
                            announcement.createdAt ||
                            Date.now(),
                        ).toLocaleDateString()}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {announcement.title}
                    </h3>
                    <p
                      className="text-gray-500 leading-7"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {announcement.content}
                    </p>
                  </div>
                ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              to="/announcements"
              className="inline-flex items-center justify-center rounded-full bg-amber-500 px-8 py-3 text-white hover:bg-amber-600 transition"
            >
              View All Announcements
            </Link>
          </div>
        </section>

        <section className="py-20 px-6 bg-emerald-950 text-white">
          <div className="max-w-7xl mx-auto grid gap-10 md:grid-cols-3">
            <div>
              <h3 className="text-xl font-bold mb-4">Church</h3>
              <p className="text-gray-300">
                A welcoming place of worship where faith, hope, and love grow.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <div className="space-y-2 text-gray-300">
                <Link to="/" className="block hover:text-white">
                  Home
                </Link>
                <Link to="/devotion" className="block hover:text-white">
                  Devotion
                </Link>
                <Link to="/announcements" className="block hover:text-white">
                  Announcements
                </Link>
                <Link to="/about" className="block hover:text-white">
                  About
                </Link>
                <Link to="/contact" className="block hover:text-white">
                  Contact
                </Link>
                <Link to="/login" className="block hover:text-white">
                  Login
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Contact</h3>
              <p className="text-gray-300">123 Church Street, City</p>
              <p className="text-gray-300 mt-2">Phone: (123) 456-7890</p>
              <div className="flex items-center gap-2 mt-4 text-gray-300">
                <MapPin size={18} />
                <span>Connect with us anytime</span>
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-white/10 pt-6 text-center text-sm text-gray-400">
            © 2026 Church. All rights reserved.
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
