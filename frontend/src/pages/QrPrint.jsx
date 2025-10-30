// frontend/src/pages/QrPrint.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { api } from "../services/api";

export default function QrPrint() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await api.get(`/students/${id}`);
        setStudent(res.data);
      } catch (err) {
        console.error("Error fetching student:", err);
        setError("Failed to load student data");
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <p className="text-center mt-10">Loading student...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;
  if (!student) return <p className="text-center mt-10">Student not found.</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="bg-white p-8 shadow-xl rounded-xl w-full max-w-md text-center">
        <h1 className="text-2xl font-semibold mb-4 text-gray-800">
          {student.fullName}
        </h1>

        <div className="flex justify-center mb-4">
          <QRCodeCanvas
            value={student.universityId || "UNKNOWN"}
            size={200}
            includeMargin={true}
          />
        </div>

        <p className="text-gray-700 mb-2">
          <strong>University ID:</strong> {student.universityId}
        </p>
        <p className="text-gray-700 mb-2">
          <strong>Department:</strong> {student.department}
        </p>
        <p className="text-gray-700 mb-2">
          <strong>Batch:</strong> {student.batch}
        </p>

        <button
          onClick={handlePrint}
          className="mt-6 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Print QR Card
        </button>
      </div>
    </div>
  );
}
