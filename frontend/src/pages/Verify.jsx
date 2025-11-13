// src/pages/Verify.jsx
import React, { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { supabase } from "../services/supabase_connect";

const Verify = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", true); // iOS support
          videoRef.current.play();
        }

        requestAnimationFrame(scanFrame);
      } catch (err) {
        console.error("Camera error:", err);
        setStatus("❌ Unable to access camera");
      }
    };

    startCamera();

    return () => {
      // Stop camera on unmount
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const scanFrame = () => {
    if (
      videoRef.current &&
      videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA
    ) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      const code = jsQR(imageData.data, canvas.width, canvas.height);

      if (code) {
        handleScan(code.data);
      }
    }

    requestAnimationFrame(scanFrame);
  };

  const handleScan = async (data) => {
    if (!data) return;

    try {
      let scanned;
      try {
        scanned = JSON.parse(data);
      } catch {
        scanned = { studentId: data };
      }

      const studentId = scanned.studentId || scanned.id || data.trim();

      const { data: student, error } = await supabase
        .from("students")
        .select("*")
        .eq("student_id", studentId)
        .single();

      if (error || !student) {
        setStatus("❌ Student not found or invalid QR");
        setResult(null);
      } else {
        setResult(student);
        setStatus("✅ Verified successfully");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setStatus("⚠️ Verification failed");
      setResult(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-4">QR Code Verification</h1>

      <div className="w-[400px] h-[400px] bg-black rounded-lg overflow-hidden relative">
        <video ref={videoRef} className="w-full h-full object-cover" />
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>

      <p className="mt-4 text-gray-800">{status}</p>

      {result && (
        <div className="mt-6 bg-white p-4 rounded-lg shadow-md w-96">
          <h2 className="text-lg font-semibold">Student Info</h2>
          <p>
            <strong>ID:</strong> {result.student_id}
          </p>
          <p>
            <strong>Name:</strong> {result.first_name} {result.last_name}
          </p>
          <p>
            <strong>Department:</strong> {result.department}
          </p>
        </div>
      )}
    </div>
  );
};

export default Verify;
