// frontend/src/pages/Register.jsx
import React, { useState } from "react";
import { api } from "../services/api";

export default function Register() {
  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "",
    email: "",
    phoneNumber: "",
    department: "",
    batch: "",
    universityId: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/register-student", form);
      if (res.data.success) {
        alert("Student registered successfully!");
        // optionally clear form
        setForm({
          firstName: "",
          middleName: "",
          lastName: "",
          gender: "",
          email: "",
          phoneNumber: "",
          department: "",
          batch: "",
          universityId: ""
        });
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6">Register Student</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white p-6 rounded shadow space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input required name="firstName" value={form.firstName} onChange={handleChange} placeholder="First Name" className="p-2 border rounded" />
          <input required name="middleName" value={form.middleName} onChange={handleChange} placeholder="Middle Name" className="p-2 border rounded" />
          <input required name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last Name" className="p-2 border rounded" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <select name="gender" value={form.gender} onChange={handleChange} className="p-2 border rounded">
            <option value="">Gender (optional)</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <input required name="email" value={form.email} onChange={handleChange} placeholder="Email" className="p-2 border rounded" />
          <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="Phone" className="p-2 border rounded" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input required name="department" value={form.department} onChange={handleChange} placeholder="Department" className="p-2 border rounded" />
          <input name="batch" value={form.batch} onChange={handleChange} placeholder="Batch" className="p-2 border rounded" />
          <input required name="universityId" value={form.universityId} onChange={handleChange} placeholder="University ID" className="p-2 border rounded" />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded">
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}
