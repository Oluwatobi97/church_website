import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-6 rounded-3xl border border-emerald-100 bg-emerald-50 p-12 text-center shadow-sm">
        <p className="text-6xl font-black text-emerald-700">404</p>
        <h1 className="text-3xl font-bold text-gray-900">Page Not Found</h1>
        <p className="max-w-xl text-sm text-gray-600">
          The page you are looking for does not exist. Choose an option below to
          continue.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            Go Home
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center justify-center rounded-full border border-emerald-700 bg-white px-6 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
