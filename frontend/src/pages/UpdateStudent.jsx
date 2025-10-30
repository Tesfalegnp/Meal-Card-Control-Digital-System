import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function UpdateStudent() {
  const { state } = useLocation();
  const student = state?.student;
  const navigate = useNavigate();
  const [form, setForm] = useState(student || {});

  if (!student) {
    return <p className="text-center p-10">No student data found!</p>;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/students/${student.id}`, form);
      if (res.data.success) {
        alert("Student updated successfully!");
        navigate("/students");
      } else {
        alert("Update failed");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update student");
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-center">✏️ Update Student</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {["fullName", "universityId", "department", "batch", "email"].map((field) => (
          <div key={field}>
            <label className="block text-gray-700 capitalize">{field.replace(/([A-Z])/g, " $1")}</label>
            <input
              type="text"
              name={field}
              value={form[field] || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
            />
          </div>
        ))}
        <div className="flex justify-between mt-4">
          <button
            type="button"
            onClick={() => navigate("/students")}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
