import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Contact = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold">Contact Us</h1>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            We are here to help. Reach out with questions, prayer requests, or
            to learn how to get involved.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Visit Us</h2>
            <p className="text-gray-600">123 Church Street</p>
            <p className="text-gray-600">City, State 12345</p>
            <p className="text-gray-600 mt-4">Phone: (123) 456-7890</p>
            <p className="text-gray-600">Email: info@church.org</p>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4 text-emerald-600">
              <MapPin size={24} />
              <span className="text-xl font-semibold">Office Hours</span>
            </div>
            <p className="text-gray-600 mb-2">
              Monday - Friday: 8:00 AM - 5:00 PM
            </p>
            <p className="text-gray-600 mb-2">Saturday: 9:00 AM - 1:00 PM</p>
            <p className="text-gray-600">
              Sunday: Worship services begin at 9:00 AM
            </p>
          </div>
        </div>

        <div className="mt-14 text-center">
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

export default Contact;
