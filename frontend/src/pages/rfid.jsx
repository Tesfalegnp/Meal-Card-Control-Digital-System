// src/pages/Rfid.jsx
import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../services/supabase_connect";
import { format } from "date-fns";

const Rfid = () => {
  const [uid, setUid] = useState("");
  const [status, setStatus] = useState("Scan RFID Card...");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  // POPUP STATE
  const [popup, setPopup] = useState(null); // {name, id, reason}
  const popupRef = useRef(null);

  // --------------------- SOUND SYSTEM ----------------------------
  const audioRefs = useRef({
    soft: null,
    success: null,
    reject: null,
    warning: null,
  });

  useEffect(() => {
    const paths = {
      soft: "/sound/soft.mp3",
      success: "/sound/success.mp3",
      reject: "/sound/reject.mp3",
      warning: "/sound/waring.wav",
    };

    const createAudio = (src, loop = false, volume = 0.7) => {
      const audio = new Audio(src);
      audio.preload = "auto";
      audio.loop = loop;
      audio.volume = volume;
      return audio;
    };

    audioRefs.current.soft = createAudio(paths.soft, true, 0.4);
    audioRefs.current.success = createAudio(paths.success);
    audioRefs.current.reject = createAudio(paths.reject);
    audioRefs.current.warning = createAudio(paths.warning);

    setTimeout(() => {
      audioRefs.current.soft.play().catch(() => {});
    }, 300);

    return () => {
      Object.values(audioRefs.current).forEach((a) => a?.pause());
    };
  }, []);

  const playSound = async (type) => {
    const soft = audioRefs.current.soft;
    const sound = audioRefs.current[type];
    if (!sound) return;

    soft.pause();
    sound.currentTime = 0;

    await sound.play().catch(() => {});

    sound.onended = () => {
      soft.play().catch(() => {});
    };
  };
  // ---------------------------------------------------------------

  const mealTypes = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner" };

  // ---------------------- RFID POLLING ---------------------------
  useEffect(() => {
    const interval = setInterval(fetchUID, 800);
    return () => clearInterval(interval);
  }, [busy, uid]);

  const fetchUID = async () => {
    if (busy) return;

    try {
      const response = await fetch("http://localhost:5000/rfid/latest");
      const data = await response.json();

      if (!data.uid || data.uid === uid) return;

      setUid(data.uid);
      setBusy(true);
      handleScan(data.uid);
    } catch (err) {
      console.error("RFID fetch error:", err);
    }
  };
  // ---------------------------------------------------------------

  const showPopup = (student, reason) => {
    setPopup({
      name: `${student.first_name} ${student.last_name}`,
      id: student.student_id,
      reason,
    });

    playSound("warning");

    if (popupRef.current) popupRef.current.classList.add("animate-popup");

    setTimeout(() => {
      setPopup(null);
    }, 2500);
  };

  // --------------------------- DB HELPERS ---------------------------
  const getCurrentMealType = async () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const currentTime = format(now, "HH:mm");

    const { data } = await supabase
      .from("menu_schedule")
      .select("*")
      .eq("day_of_week", dayOfWeek)
      .eq("is_active", true);

    if (!data) return null;

    for (const s of data) {
      if (currentTime >= s.start_time && currentTime <= s.end_time) {
        return s.meal_type.toLowerCase();
      }
    }
    return null;
  };

  const isStudentDenied = async (studentId, mealType, date) => {
    const today = format(date, "yyyy-MM-dd");

    const { data } = await supabase
      .from("denied_students")
      .select("*")
      .eq("student_id", studentId)
      .eq("is_active", true);

    if (!data) return false;

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
    const { data } = await supabase
      .from("meal_records")
      .select("id")
      .eq("student_id", studentId)
      .eq("meal_type", mealType)
      .eq("meal_date", format(date, "yyyy-MM-dd"));

    return data && data.length > 0;
  };
  // ---------------------------------------------------------------

  // --------------------------- MAIN LOGIC ---------------------------
  const handleScan = async (rfid) => {
    setStatus("Verifying...");
    setResult(null);

    try {
      const today = new Date();
      const mealType = await getCurrentMealType();

      if (!mealType) {
        setStatus("Outside meal hours.");
        playSound("warning");
        return reset();
      }

      const { data: student, error } = await supabase
        .from("students")
        .select("*")
        .eq("rfid_uid", rfid)
        .single();

      if (error || !student) {
        playSound("reject");
        setStatus("Unregistered RFID");
        return reset();
      }

      const denied = await isStudentDenied(student.student_id, mealType, today);
      if (denied) {
        setStatus("Denied Access");
        showPopup(student, "Access Denied for this meal");
        return reset();
      }

      const already = await hasAlreadyVerifiedToday(student.student_id, mealType, today);
      if (already) {
        setStatus("Already Verified Today");
        showPopup(student, "Already eaten this meal today");
        return reset();
      }

      await supabase.from("meal_records").insert({
        student_id: student.student_id,
        meal_type: mealType,
        meal_date: format(today, "yyyy-MM-dd"),
        consumed_at: today.toISOString(),
      });

      setResult(student);
      setStatus(`Verified for ${mealTypes[mealType]}`);
      playSound("success");
    } catch {
      setStatus("Verification Error");
      playSound("reject");
    }

    reset();
  };

  const reset = () => {
    setTimeout(() => {
      setStatus("Scan RFID Card...");
      setUid("");
      setResult(null);
      setBusy(false);

      audioRefs.current.soft.play().catch(() => {});
    }, 3000);
  };
  // -------------------------------------------------------------------

  return (
    <>
      {/* 🔥 POPUP CENTER WARNING */}
      {popup && (
        <div
          ref={popupRef}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          bg-red-600 text-white px-8 py-6 rounded-2xl shadow-2xl text-center
          font-bold text-xl animate-popup z-50"
        >
          <div className="text-5xl mb-3">⚠️</div>
          <p className="text-2xl">{popup.name}</p>
          <p className="text-lg opacity-75">ID: {popup.id}</p>
          <p className="mt-3 bg-red-700 px-4 py-2 rounded-xl">{popup.reason}</p>
        </div>
      )}

      {/* MAIN UI */}
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
            RFID Verification
          </h1>

          <div className="text-center mb-6">
            <p
              className={`text-lg font-semibold p-4 rounded-xl transition-all duration-300 ${
                status.includes("Verified")
                  ? "bg-green-100 text-green-800"
                  : status.includes("Denied") ||
                    status.includes("Unregistered")
                  ? "bg-red-100 text-red-800"
                  : status.includes("Already") ||
                    status.includes("Outside")
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {status}
            </p>
          </div>

          {result && (
            <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-200 animate-pulse">
              <h2 className="text-xl font-bold text-gray-800 mb-3">
                Student Verified
              </h2>
              <p><strong>ID:</strong> {result.student_id}</p>
              <p><strong>Name:</strong> {result.first_name} {result.last_name}</p>
              <p><strong>Department:</strong> {result.department}</p>
            </div>
          )}

          <div className="mt-6 text-center text-xs text-gray-500">
            Waiting for next card...
          </div>
        </div>
      </div>

      {/* 🔥 FADE ANIMATION */}
      <style>
        {`
          .animate-popup {
            animation: popfade 0.6s ease-in-out 3;
          }
          @keyframes popfade {
            0% { opacity: 0; transform: scale(0.6); }
            50% { opacity: 1; transform: scale(1); }
            100% { opacity: 0; transform: scale(0.6); }
          }
        `}
      </style>
    </>
  );
};

export default Rfid;
