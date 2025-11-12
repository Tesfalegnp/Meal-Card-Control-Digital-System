// src/pages/Verify.jsx
import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { supabase } from "../services/supabase_connect";

export default function Verify() {
  const [verified, setVerified] = useState(null);
  const [error, setError] = useState(null);
  const [scanner, setScanner] = useState(null);

  useEffect(() => {
    let html5QrcodeScanner;

    const startScanner = () => {
      html5QrcodeScanner = new Html5QrcodeScanner(
        "reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_QR_CODE]
        },
        false
      );

      html5QrcodeScanner.render(onScanSuccess, onScanFailure);
      setScanner(html5QrcodeScanner);
    };

    const onScanSuccess = async (decodedText) => {
      console.log("✅ QR Code scanned:", decodedText);
      setError(null);
      setVerified({ status: "verifying" });

      try {
        // Parse QR code data (assuming it's JSON string)
        let qrData;
        try {
          qrData = JSON.parse(decodedText);
        } catch {
          // If not JSON, treat as student ID directly
          qrData = { studentId: decodedText };
        }

        const studentId = qrData.studentId || decodedText;

        // Check if student exists in database
        const { data: student, error: studentError } = await supabase
          .from('students')
          .select('*')
          .eq('student_id', studentId)
          .single();

        if (studentError || !student) {
          throw new Error("Student not found in database");
        }

        // Check if student is denied access
        const { data: deniedStudent } = await supabase
          .from('denied_students')
          .select('*')
          .eq('student_id', studentId)
          .eq('is_active', true)
          .single();

        if (deniedStudent) {
          throw new Error("Student access is denied");
        }

        // Determine current meal type based on time
        const currentHour = new Date().getHours();
        let mealType = 'dinner';
        if (currentHour < 10) mealType = 'breakfast';
        else if (currentHour < 16) mealType = 'lunch';

        // Check if student already consumed this meal today
        const today = new Date().toISOString().split('T')[0];
        const { data: existingMeal } = await supabase
          .from('meal_records')
          .select('*')
          .eq('student_id', studentId)
          .eq('meal_type', mealType)
          .eq('meal_date', today)
          .single();

        if (existingMeal) {
          throw new Error(`Student already consumed ${mealType} today`);
        }

        // Record the meal consumption
        const { error: mealError } = await supabase
          .from('meal_records')
          .insert([
            {
              student_id: studentId,
              meal_type: mealType,
              meal_date: today,
              consumed_at: new Date().toISOString()
            }
          ]);

        if (mealError) throw mealError;

        // Success - show student info
        setVerified({
          status: "success",
          student: {
            fullName: `${student.first_name} ${student.last_name}`,
            universityId: student.student_id,
            department: student.department,
            batch: student.year ? new Date(student.year).getFullYear() : 'N/A'
          },
          mealType: mealType,
          message: `Successfully verified for ${mealType}`
        });

        // Stop scanner after successful verification
        if (html5QrcodeScanner) {
          html5QrcodeScanner.clear().catch(console.error);
        }

      } catch (err) {
        console.error("❌ Verification failed:", err);
        setError(err.message || "Verification failed");
        setVerified(null);
      }
    };

    const onScanFailure = (error) => {
      // Quietly handle scan errors - don't show in UI unless needed
      console.warn("QR Scan error:", error);
    };

    startScanner();

    // Cleanup on unmount
    return () => {
      if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().catch(console.error);
      }
    };
  }, []);

  const restartScanner = () => {
    setVerified(null);
    setError(null);
    if (scanner) {
      scanner.clear().catch(console.error);
    }
    // Reinitialize scanner
    const html5QrcodeScanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
      },
      false
    );
    html5QrcodeScanner.render(
      (decodedText) => onScanSuccess(decodedText),
      (error) => console.warn("Scan error:", error)
    );
    setScanner(html5QrcodeScanner);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">
          Meal Card Verification
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Scan student QR code to verify meal access
        </p>

        {/* QR Scanner View */}
        <div
          id="reader"
          className="w-full bg-white p-4 rounded-lg shadow-md"
        ></div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-md">
            <div className="flex items-center">
              <span className="text-xl mr-2">❌</span>
              <span className="font-semibold">{error}</span>
            </div>
            <button
              onClick={restartScanner}
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
            >
              Scan Again
            </button>
          </div>
        )}

        {/* Verifying Message */}
        {verified?.status === "verifying" && (
          <div className="mt-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg shadow-md">
            <div className="flex items-center">
              <span className="text-xl mr-2">⏳</span>
              <span>Verifying student...</span>
            </div>
          </div>
        )}

        {/* Verified Success */}
        {verified?.status === "success" && (
          <div className="mt-4 bg-green-100 border border-green-400 text-green-800 px-4 py-4 rounded-lg shadow-md">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <span className="text-2xl mr-2">✅</span>
                <span className="text-lg font-semibold">Verified Successfully</span>
              </div>
              
              <div className="space-y-2 text-left bg-white p-3 rounded-md mt-3">
                <p>
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
                <p>
                  <strong>Meal:</strong> {verified.mealType}
                </p>
                <p>
                  <strong>Time:</strong> {new Date().toLocaleTimeString()}
                </p>
              </div>

              <button
                onClick={restartScanner}
                className="mt-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
              >
                Scan Next Student
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Point the camera at the student's QR code</p>
          <p>Ensure good lighting for better scanning</p>
        </div>
      </div>
    </div>
  );
}