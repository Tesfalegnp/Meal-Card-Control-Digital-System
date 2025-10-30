// frontend/src/pages/Verify.js
import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { api } from "../services/api";

export default function Verify() {
  const [verified, setVerified] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let scanner;

    const startScanner = () => {
      scanner = new Html5QrcodeScanner("reader", {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
      });

      scanner.render(onScanSuccess, onScanFailure);
    };

    const onScanSuccess = async (decodedText) => {
      console.log("✅ QR detected:", decodedText);
      setError(null);
      setVerified({ status: "verifying" });

      try {
        // Call backend for verification
        const res = await api.post("/verify-meal", { qrData: decodedText });
        const data = res.data;

        if (data.success) {
          setVerified({
            status: "success",
            student: data.student,
            message: data.message,
          });
          // Stop scanning once verified
          scanner.clear().catch(() => {});
        } else {
          setVerified(null);
          setError("❌ Student not found or invalid QR code.");
        }
      } catch (err) {
        console.error("❌ Verification failed:", err);
        setError("Server error or invalid QR.");
        setVerified(null);
      }
    };

    const onScanFailure = (err) => {
      // You can log continuously scanning errors quietly
      // console.warn("Scan error:", err);
    };

    startScanner();

    // cleanup on unmount
    return () => {
      if (scanner) {
        scanner.clear().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Meal Card Verification
      </h1>

      {/* QR Scanner View */}
      <div
        id="reader"
        className="w-full max-w-md bg-white p-4 rounded-lg shadow-md"
      ></div>

      {/* Error */}
      {error && (
        <div className="mt-4 bg-red-100 text-red-700 px-6 py-3 rounded-lg shadow-md">
          {error}
        </div>
      )}

      {/* Verifying */}
      {verified?.status === "verifying" && (
        <div className="mt-4 bg-yellow-100 text-yellow-800 px-6 py-3 rounded-lg shadow-md">
          ⏳ Verifying student...
        </div>
      )}

      {/* Verified Success */}
      {verified?.status === "success" && (
        <div className="mt-4 bg-green-100 text-green-800 px-6 py-4 rounded-lg shadow-md text-center">
          <p className="text-lg font-semibold">✅ Verified Successfully</p>
          <p className="mt-2">
            <strong>Name:</strong> {verified.student.fullName}
          </p>
          <p>
            <strong>ID:</strong> {verified.student.universityId}
          </p>
          <p>
            <strong>Department:</strong> {verified.student.department}
          </p>
          <p>
            <strong>Batch:</strong> {verified.student.batch}
          </p>
        </div>
      )}
    </div>
  );
}
