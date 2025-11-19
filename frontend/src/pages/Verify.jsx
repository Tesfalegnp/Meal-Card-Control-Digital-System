// src/pages/Verify.jsx
import React, { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { supabase } from "../services/supabase_connect";
import { format } from "date-fns";

const Verify = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("Point camera at QR code");
  const [result, setResult] = useState(null);
  const [scanning, setScanning] = useState(true);
  const lastScanned = useRef(null);

  // ---- SOUND MANAGEMENT ----------------------------------------------------
  const audioRefs = useRef({
    success: null,
    reject: null,
    warning: null,
    tick: null,
  });

  // Pre-load sounds using hidden <audio> elements
  useEffect(() => {
    const paths = {
      success: "/sound/success.mp3",
      reject: "/sound/reject.mp3",
      warning: "/sound/warning.mp3",
      tick: "/sound/tick.mp3",
    };

    const createAudio = (src) => {
      const el = document.createElement("audio");
      el.src = src;
      el.preload = "auto";
      el.volume = 0.7;
      document.body.appendChild(el);
      return el;
    };

    audioRefs.current.success = createAudio(paths.success);
    audioRefs.current.reject = createAudio(paths.reject);
    audioRefs.current.warning = createAudio(paths.warning);
    audioRefs.current.tick = createAudio(paths.tick);

    // Cleanup
    return () => {
      Object.values(audioRefs.current).forEach((el) => el?.remove());
    };
  }, []);

  const playSound = (type) => {
    const audio = audioRefs.current[type];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  };
  // -------------------------------------------------------------------------

  const mealTypes = {
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
  };

  // --------------------------- CAMERA ---------------------------------------
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", "true");
          videoRef.current.play();
        }
        requestAnimationFrame(scanFrame);
      } catch (err) {
        console.error("Camera error:", err);
        setStatus("Unable to access camera");
        playSound("reject");
      }
    };
    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);
  // -------------------------------------------------------------------------

  const scanFrame = () => {
    if (!scanning) return;

    if (
      videoRef.current &&
      videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA
    ) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, canvas.width, canvas.height);

      if (code && code.data !== lastScanned.current) {
        lastScanned.current = code.data;
        handleScan(code.data);
        setScanning(false);
        setTimeout(() => {
          lastScanned.current = null;
          setScanning(true);
          playSound("tick");
        }, 3000);
      }
    }
    requestAnimationFrame(scanFrame);
  };

  // ---------------------- SUPABASE HELPERS ---------------------------------
  const getCurrentMealType = async () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const currentTime = format(now, "HH:mm");

    const { data, error } = await supabase
      .from("menu_schedule")
      .select("meal_type, start_time, end_time")
      .eq("day_of_week", dayOfWeek)
      .eq("is_active", true);

    if (error || !data) return null;

    for (const s of data) {
      if (currentTime >= s.start_time && currentTime <= s.end_time) {
        return s.meal_type.toLowerCase();
      }
    }
    return null;
  };

  const isStudentDenied = async (studentId, mealType, date) => {
    const { data, error } = await supabase
      .from("denied_students")
      .select("meal_types, start_date, end_date")
      .eq("student_id", studentId)
      .eq("is_active", true);

    if (error || !data) return false;

    const today = format(date, "yyyy-MM-dd");
    for (const d of data) {
      const start = d.start_date;
      const end = d.end_date ?? today;
      if (today >= start && today <= end && d.meal_types.includes(mealType)) {
        return true;
      }
    }
    return false;
  };

  const hasAlreadyVerifiedToday = async (studentId, mealType, date) => {
    const { data, error } = await supabase
      .from("meal_records")
      .select("id")
      .eq("student_id", studentId)
      .eq("meal_type", mealType)
      .eq("meal_date", format(date, "yyyy-MM-dd"))
      .limit(1);

    return !error && data && data.length > 0;
  };
  // -------------------------------------------------------------------------

  const handleScan = async (data) => {
    if (!data) return;

    setStatus("Verifying...");
    playSound("tick");
    setResult(null);

    try {
      let scanned;
      try {
        scanned = JSON.parse(data);
      } catch {
        scanned = { studentId: data.trim() };
      }
      const studentId = scanned.studentId || scanned.id || data.trim();
      const today = new Date();
      const mealType = await getCurrentMealType();

      if (!mealType) {
        setStatus("Outside meal hours. No service active.");
        playSound("warning");
        return;
      }

      const { data: student, error: studentError } = await supabase
        .from("students")
        .select("student_id, first_name, last_name, department")
        .eq("student_id", studentId)
        .single();

      if (studentError || !student) {
        setStatus("Student not found or invalid QR");
        playSound("reject");
        return;
      }

      const denied = await isStudentDenied(studentId, mealType, today);
      if (denied) {
        setStatus(`Access DENIED for ${mealTypes[mealType]}. Contact admin.`);
        playSound("reject");
        return;
      }

      const already = await hasAlreadyVerifiedToday(studentId, mealType, today);
      if (already) {
        setStatus(`Already verified for ${mealTypes[mealType]} today.`);
        playSound("warning");
        return;
      }

      const { error: insertError } = await supabase.from("meal_records").insert({
        student_id: studentId,
        meal_type: mealType,
        meal_date: format(today, "yyyy-MM-dd"),
        consumed_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error("Insert error:", insertError);
        setStatus("Verification failed. Try again.");
        playSound("reject");
        return;
      }

      setResult(student);
      setStatus(`Verified for ${mealTypes[mealType]}`);
      playSound("success");
    } catch (err) {
      console.error("Verification error:", err);
      setStatus("Verification failed");
      playSound("reject");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          QR Code Verification
        </h1>

        <div className="relative w-full h-64 bg-black rounded-xl overflow-hidden mb-6">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            muted
            playsInline
          />
          <canvas ref={canvasRef} style={{ display: "none" }} />
          <div className="absolute inset-0 border-4 border-white border-dashed rounded-xl pointer-events-none" />
        </div>

        <div className="text-center mb-6">
          <p 
            className={`text-lg font-semibold p-4 rounded-xl transition-all duration-300 ${
              status.includes("Verified")
                ? "bg-green-100 text-green-800 border border-green-300"
                : status.includes("DENIED") ||
                  status.includes("failed") ||
                  status.includes("invalid")
                ? "bg-red-100 text-red-800 border border-red-300"
                : status.includes("Outside") || status.includes("Already")
                ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                : "bg-blue-100 text-blue-800 border border-blue-300"
            }`}
          >
            {status}
          </p>
        </div>

        {result && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-5 rounded-xl border border-green-200 animate-pulse">
            <h2 className="text-xl font-bold text-gray-800 mb-3">
              Student Verified
            </h2>
            <div className="space-y-2 text-sm">
              <p>
                <strong>ID:</strong>{" "}
                <span className="font-mono text-green-700">{result.student_id}</span>
              </p>
              <p>
                <strong>Name:</strong> {result.first_name} {result.last_name}
              </p>
              <p>
                <strong>Department:</strong> {result.department}
              </p>
              <p className="mt-3 text-green-700 font-semibold">
                Meal recorded successfully!
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Scan again in 3 seconds...</p>
        </div>
      </div>
    </div>
  );
};

export default Verify;