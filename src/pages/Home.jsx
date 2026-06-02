import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Play,
  Clock,
  Megaphone,
  BookOpen,
  Users,
  Heart,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { devotionAPI, announcementAPI } from "../services/api";

// ─── Skeleton Loader ───────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm animate-pulse">
    <div className="h-1 rounded-full bg-gradient-to-r from-gray-200 to-gray-100 mb-6" />
    <div className="h-6 w-2/3 rounded bg-gray-200 mb-4" />
    <div className="space-y-2 mb-4">
      <div className="h-4 rounded bg-gray-200" />
      <div className="h-4 rounded bg-gray-200 w-5/6" />
    </div>
    <div className="h-4 w-20 rounded bg-gray-200" />
  </div>
);

// ─── Feature Card ─────────────────────────────────────────────────────────
const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    viewport={{ once: true }}
    whileHover={{ y: -4 }}
    className="group rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md p-8 text-center transition-all"
  >
    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-100 transition-colors">
      <Icon size={28} className="text-emerald-600" />
    </div>
    <h3 className="font-bold text-lg text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

// ─── Service Time Card ────────────────────────────────────────────────────
const ServiceCard = ({ day, time, programme, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    viewport={{ once: true }}
    whileHover={{ y: -4 }}
    className="border border-gray-200 rounded-2xl p-6 text-center bg-white shadow-sm hover:shadow-md hover:border-emerald-200 transition-all"
  >
    <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
      <Clock size={24} className="text-emerald-600" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-1">{day}</h3>
    <p className="text-gray-400 text-sm mb-2">{time}</p>
    <p className="text-emerald-600 font-semibold text-sm">{programme}</p>
  </motion.div>
);

// ─── Devotion Card ────────────────────────────────────────────────────────
const DevotionCard = ({ devotion, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    viewport={{ once: true }}
    whileHover={{ y: -4 }}
    className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all"
  >
    <div className="h-1 bg-gradient-to-r from-emerald-500 to-emerald-300" />
    <div className="p-6">
      <div className="inline-flex items-center gap-2 mb-4">
        <BookOpen size={14} className="text-emerald-600" />
        <span className="text-xs text-emerald-700 bg-emerald-50 rounded-full px-3 py-1 font-semibold">
          {new Date(
            devotion.date || devotion.createdAt || Date.now(),
          ).toLocaleDateString("en-NG", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
        {devotion.title}
      </h3>
      <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-4">
        {devotion.content}
      </p>
      <Link
        to="/devotion"
        className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-sm hover:text-emerald-700 group-hover:gap-2 transition-all"
      >
        Read More
        <ChevronRight size={16} />
      </Link>
    </div>
  </motion.div>
);

// ─── Announcement Card ────────────────────────────────────────────────────
const AnnouncementCard = ({ announcement, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: -16 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.4 }}
    viewport={{ once: true }}
    className="rounded-2xl border-l-4 border-amber-400 bg-white p-6 shadow-sm hover:shadow-md transition-all"
  >
    <div className="flex items-start justify-between gap-4 mb-3">
      <div className="flex items-center gap-2">
        <span className="text-amber-600 text-xl">📢</span>
        <span className="font-semibold text-amber-700 text-sm">
          Announcement
        </span>
      </div>
      <span className="text-xs text-gray-400 shrink-0">
        {new Date(
          announcement.date || announcement.createdAt || Date.now(),
        ).toLocaleDateString("en-NG", {
          month: "short",
          day: "numeric",
        })}
      </span>
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
      {announcement.title}
    </h3>
    <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
      {announcement.content}
    </p>
  </motion.div>
);

// ─── Home Component ───────────────────────────────────────────────────────
const Home = () => {
  const [devotions, setDevotions] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loadingDevotions, setLoadingDevotions] = useState(true);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadDevotions = async () => {
      try {
        const response = await devotionAPI.getAll();
        const data = Array.isArray(response) ? response : response?.data || [];
        setDevotions(data.slice(0, 3));
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
        const data = Array.isArray(response) ? response : response?.data || [];
        setAnnouncements(data.slice(0, 3));
      } catch {
        setAnnouncements([]);
      } finally {
        setLoadingAnnouncements(false);
      }
    };
    loadAnnouncements();
  }, []);

  return (
    <div className="bg-white">
      {/* ── HERO SECTION ──────────────────────────────────────────────── */}
      <div className="relative h-[90vh] min-h-screen flex items-center justify-center overflow-hidden pt-16 lg:pt-0">
        <img
          src="https://images.unsplash.com/photo-1507692049790-de58290a4334?w=1200&q=80"
          alt="Church worship"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/85 via-emerald-800/70 to-emerald-900/60" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 flex flex-col justify-center items-center text-center px-4 sm:px-6"
        >
          {/* Play Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="mb-8 bg-white/10 p-5 rounded-full backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <Play size={32} className="text-white fill-white" />
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight max-w-4xl"
          >
            Foursquare Gospel Church <br className="hidden sm:block" />
            <span className="text-emerald-300">Yotomi Golden Estate</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="max-w-2xl text-lg sm:text-xl text-gray-100 mb-8"
          >
            Bringing people closer to God through worship, teaching, and
            community.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <button
              onClick={() => navigate("/about")}
              className="group flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-full font-semibold transition-all shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50"
            >
              Learn More
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="group flex items-center justify-center gap-2 rounded-full border-2 border-white text-white px-8 py-4 hover:bg-white/10 backdrop-blur-sm transition-all font-semibold"
            >
              Join Us Sunday
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="text-white/50 text-sm">Scroll to explore</div>
        </motion.div>
      </div>

      <main className="relative z-20">
        {/* ── ABOUT SECTION ─────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="py-16 sm:py-20 px-4 sm:px-6 text-center bg-white"
        >
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              A Church that loves God and people
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              We are committed to building a strong community of believers,
              growing spiritually, and spreading the love of Christ through
              worship, teaching, and service.
            </p>
          </div>
        </motion.section>

        {/* ── FEATURES SECTION ──────────────────────────────────────── */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                What We Offer
              </h2>
              <p className="text-gray-500 text-lg">
                Experience growth and fellowship in our community
              </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-3">
              <FeatureCard
                icon={Heart}
                title="Prayers & Worship"
                description="Experience growth and connection through heartfelt worship and prayer."
                delay={0.1}
              />
              <FeatureCard
                icon={BookOpen}
                title="Bible Teaching"
                description="Grow deeper in faith through Scripture-based teaching and discipleship."
                delay={0.2}
              />
              <FeatureCard
                icon={Users}
                title="Community Care"
                description="Join a family that serves, supports, and encourages one another in Christ."
                delay={0.3}
              />
            </div>
          </div>
        </section>

        {/* ── SERVICE TIMES SECTION ─────────────────────────────────── */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                Join Us Every Week
              </h2>
              <p className="text-gray-500 text-lg">
                Worship with us and experience intentional fellowship
              </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-3">
              <ServiceCard
                day="Tuesday"
                time="6:00 AM"
                programme="Prayers"
                delay={0.1}
              />
              <ServiceCard
                day="Friday"
                time="6:00 AM"
                programme="Intercession"
                delay={0.2}
              />
              <ServiceCard
                day="Sunday"
                time="9:00 AM"
                programme="Main Service"
                delay={0.3}
              />
            </div>
          </div>
        </section>

        {/* ── DEVOTIONS SECTION ─────────────────────────────────────── */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                Daily Devotions
              </h2>
              <p className="text-gray-500 text-lg">
                Nourish your spirit with daily Scripture and reflection
              </p>
            </motion.div>

            <div className="grid gap-6 lg:grid-cols-3 mb-8">
              {loadingDevotions
                ? Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))
                : devotions.length > 0
                  ? devotions.map((devotion, i) => (
                      <DevotionCard
                        key={devotion.id || i}
                        devotion={devotion}
                        delay={i * 0.1}
                      />
                    ))
                  : null}
            </div>

            {devotions.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <Link
                  to="/devotion"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-emerald-600 px-8 py-3 text-emerald-600 hover:bg-emerald-50 font-semibold transition-all"
                >
                  View All Devotions
                  <ArrowRight size={18} />
                </Link>
              </motion.div>
            )}
          </div>
        </section>

        {/* ── ANNOUNCEMENTS SECTION ─────────────────────────────────── */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                Latest Announcements
              </h2>
              <p className="text-gray-500 text-lg">
                Stay updated with important church news and events
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto space-y-4 mb-8">
              {loadingAnnouncements
                ? Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))
                : announcements.length > 0
                  ? announcements.map((announcement, i) => (
                      <AnnouncementCard
                        key={announcement.id || i}
                        announcement={announcement}
                        delay={i * 0.1}
                      />
                    ))
                  : null}
            </div>

            {announcements.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <Link
                  to="/announcements"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 hover:bg-amber-600 px-8 py-3 text-white font-semibold transition-all shadow-lg shadow-amber-500/30"
                >
                  View All Announcements
                  <ArrowRight size={18} />
                </Link>
              </motion.div>
            )}
          </div>
        </section>

        {/* ── CTA SECTION ───────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white text-center"
        >
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to join our community?
            </h2>
            <p className="text-emerald-100 text-lg mb-8">
              Experience the transformative power of faith, worship, and
              fellowship with us.
            </p>
            <button
              onClick={() => navigate("/contact")}
              className="group inline-flex items-center justify-center gap-2 bg-white text-emerald-600 px-8 py-4 rounded-full font-semibold hover:bg-emerald-50 transition-all shadow-lg"
            >
              Get In Touch
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>
        </motion.section>
      </main>

      {/* ── FOOTER ────────────────────────────────────────────────── */}
      <footer className="bg-emerald-900 text-white py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8 pb-8 border-b border-emerald-800">
            {/* Church Info */}
            <div>
              <h3 className="font-bold text-lg mb-3">Church Info</h3>
              <p className="text-emerald-100 text-sm leading-relaxed">
                Foursquare Gospel Church, Yotomi Golden Estate. Bringing
                communities closer to God through worship and faith.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-bold text-lg mb-3">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="/"
                    className="text-emerald-100 hover:text-white transition"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/devotion"
                    className="text-emerald-100 hover:text-white transition"
                  >
                    Devotion
                  </Link>
                </li>
                <li>
                  <Link
                    to="/announcements"
                    className="text-emerald-100 hover:text-white transition"
                  >
                    Announcements
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="text-emerald-100 hover:text-white transition"
                  >
                    About
                  </Link>
                </li>
              </ul>
            </div>

            {/* Service Times */}
            <div>
              <h3 className="font-bold text-lg mb-3">Service Times</h3>
              <ul className="space-y-2 text-sm text-emerald-100">
                <li>Tuesday: 6:00 AM - Prayers</li>
                <li>Friday: 6:00 AM - Intercession</li>
                <li>Sunday: 9:00 AM - Main Service</li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center text-emerald-100 text-sm">
            <p>
              © 2026 Foursquare Gospel Church. All rights reserved. To the glory
              of God.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
