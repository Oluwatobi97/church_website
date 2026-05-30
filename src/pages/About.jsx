import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold">About Our Church</h1>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            We are a community committed to worship, teaching, and service. Join
            us as we grow together in faith and share the love of Christ.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Our Mission</h2>
            <p className="text-gray-600">
              To lead people to Jesus through worship, teaching, and community.
            </p>
          </div>
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Our Vision</h2>
            <p className="text-gray-600">
              A growing church where every person experiences hope and
              belonging.
            </p>
          </div>
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Get Involved</h2>
            <p className="text-gray-600">
              Attend services, volunteer, and connect with a caring church
              family.
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/contact"
            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-8 py-3 text-white hover:bg-emerald-700 transition"
          >
            Contact Us
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full border border-emerald-600 px-8 py-3 text-emerald-600 hover:bg-emerald-50 transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
