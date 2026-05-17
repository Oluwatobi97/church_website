import { Link } from "react-router-dom";
import { Play } from "lucide-react";

const Home = () => {
  return (
    <div className="bg-white">
      {/* NAVBAR (TRANSPARENT OVER HERO) */}
      <nav className="absolute top-0 left-0 w-full flex justify-between items-center px-10 py-5 z-50 text-white">
        <h1 className="text-xl font-bold">Church</h1>

        <div className="space-x-6 hidden md:block">
          <a href="#">Home</a>
          <a href="#">Daily-Devotion</a>
          <a href="#">Announcements</a>
          <a href="#">Contact</a>
          <a href="#">About</a>
        </div>

        <Link to="/login" className="bg-orange-500 px-4 py-2 rounded">
          Login
        </Link>
      </nav>

      {/* HERO SECTION */}
      <div className="relative h-[90vh]">
        <img
          src="https://images.unsplash.com/photo-1507692049790-de58290a4334"
          alt=""
          className="w-full h-full object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60 flex flex-col justify-center items-center text-center text-white px-4">
          {/* Play Button */}
          <div className="mb-6 bg-white/20 p-4 rounded-full backdrop-blur">
            <Play size={30} />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            All You Need <br /> is Living Worship
          </h1>

          <p className="max-w-xl text-gray-200 mb-6">
            Bringing people closer to God through worship and the Word.
          </p>

          <button
            type="button"
            className="bg-orange-500 px-6 py-2 rounded hover:bg-orange-600 transition"
          >
            Learn More
          </button>
        </div>
      </div>

      {/* ABOUT SECTION */}
      <div className="py-20 px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">
          A Church that loves God and people
        </h2>

        <p className="text-gray-600 max-w-2xl mx-auto">
          We are committed to building a strong community of believers, growing
          spiritually, and spreading the love of Christ.
        </p>
      </div>

      {/* FEATURE CARDS */}
      <div className="grid md:grid-cols-3 gap-6 px-8 pb-20">
        {["Praise & Worship", "Teaching", "Community"].map((item, index) => (
          <div
            key={index}
            className="bg-white shadow-md rounded-xl p-6 text-center hover:shadow-lg transition"
          >
            <h3 className="font-bold text-lg mb-2">{item}</h3>
            <p className="text-gray-500">
              Experience growth and connection through {item.toLowerCase()}.
            </p>
          </div>
        ))}
      </div>

      {/* IMAGE + TEXT SECTION (LIKE DESIGN) */}
      <div className="grid md:grid-cols-2 gap-10 items-center px-8 py-16">
        <div className="grid grid-cols-2 gap-4">
          <img
            src="https://images.unsplash.com/photo-1515169067868-5387ec356754"
            alt=""
            className="rounded-xl"
          />
          <img
            src="https://images.unsplash.com/photo-1529070538774-1843cb3265df"
            alt=""
            className="rounded-xl mt-10"
          />
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">
            Keeping our church running smoothly
          </h2>

          <p className="text-gray-600 mb-4">
            We organize worship, teaching, and community outreach programs to
            help everyone grow in faith.
          </p>

          <button
            type="button"
            className="bg-orange-500 text-white px-5 py-2 rounded"
          >
            Learn More
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-black text-white text-center py-6">
        <p>© 2026 Church. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
