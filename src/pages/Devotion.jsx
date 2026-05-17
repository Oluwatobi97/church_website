import Sidebar from "../components/Sidebar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveToHistory } from "../utils/history";

const Devotion = () => {
  const navigate = useNavigate();
  const userRole = "admin"; // change to: "member" or "council"

  const [devotions, setDevotions] = useState([
    {
      title: "Faith in God",
      content: "Trust in the Lord with all your heart...",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "" });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAdd = () => {
    const newDevotion = formData;
    setDevotions([...devotions, newDevotion]);
    saveToHistory("Devotion", newDevotion);
    setFormData({ title: "", content: "" });
    setShowForm(false);
  };

  const handleDelete = (index) => {
    const updated = devotions.filter((_, i) => i !== index);
    setDevotions(updated);
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="p-6 w-full">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Daily Devotion</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-gray-600 text-white px-4 py-2 rounded"
          >
            Dashboard
          </button>
        </div>

        {(userRole === "admin" || userRole === "council") && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            + Add Devotion
          </button>
        )}

        {devotions.map((item, index) => (
          <div key={index} className="bg-white p-4 mb-3 rounded shadow">
            <h2 className="font-bold">{item.title}</h2>
            <p className="text-gray-600">{item.content}</p>

            {(userRole === "admin" || userRole === "council") && (
              <button
                onClick={() => handleDelete(index)}
                className="text-red-500 mt-2"
              >
                Delete
              </button>
            )}
          </div>
        ))}

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-5 rounded w-96">
              <h2 className="mb-3 font-bold">Add Devotion</h2>

              <input
                name="title"
                placeholder="Title"
                className="w-full mb-2 p-2 border"
                onChange={handleChange}
              />

              <textarea
                name="content"
                placeholder="Content"
                className="w-full mb-2 p-2 border"
                onChange={handleChange}
              />

              <div className="flex justify-between">
                <button onClick={() => setShowForm(false)}>Cancel</button>
                <button
                  onClick={handleAdd}
                  className="bg-blue-500 text-white px-3 py-1"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Devotion;
