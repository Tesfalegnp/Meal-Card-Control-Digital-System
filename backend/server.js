

// backend/server.js
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const QRCode = require('qrcode');
const path = require('path');
const { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } = require('date-fns');

// -------------------- Firebase Initialization --------------------
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://meal-card-system.firebaseio.com',
});

const db = admin.firestore();

// -------------------- Express Setup --------------------
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// -------------------- Firestore Collections --------------------
const STUDENTS_COLLECTION = 'students';
const VERIFICATIONS_COLLECTION = 'verifications';
const COMPLAINTS_COLLECTION = 'complaints';
const DENIALS_COLLECTION = 'denials';

// -------------------- Helper Functions --------------------
const todayDateString = (date = new Date()) => date.toISOString().split('T')[0];

// -------------------- 1. Register Student --------------------
app.post('/api/register-student', async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      gender,
      email,
      phoneNumber,
      department,
      batch,
      universityId,
      address,
      program,
      emergencyContact,
    } = req.body;

    if (!firstName || !lastName || !department || !universityId || !email) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: firstName, lastName, department, universityId, email',
      });
    }

    const existingSnapshot = await db
      .collection(STUDENTS_COLLECTION)
      .where('universityId', '==', universityId)
      .get();

    if (!existingSnapshot.empty) {
      return res.status(400).json({ success: false, message: 'Student with this University ID already exists' });
    }

    const studentData = {
      firstName,
      middleName: middleName || '',
      lastName,
      fullName: `${firstName} ${middleName || ''} ${lastName}`.trim(),
      gender: gender || 'Not specified',
      email,
      phoneNumber: phoneNumber || '',
      department,
      batch: batch || '',
      program: program || '',
      address: address || '',
      universityId,
      status: 'Active',
      enrollmentDate: todayDateString(),
      registrationDate: admin.firestore.FieldValue.serverTimestamp(),
      isActive: true,
      emergencyContact: emergencyContact || { name: '', phone: '', relationship: '' },
    };

    const docRef = await db.collection(STUDENTS_COLLECTION).add(studentData);

    res.json({
      success: true,
      message: 'Student registered successfully',
      studentId: docRef.id,
      studentData: { id: docRef.id, ...studentData },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

// -------------------- 2. Generate QR Code --------------------
app.get('/api/generate-qr/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const studentDoc = await db.collection(STUDENTS_COLLECTION).doc(studentId).get();

    if (!studentDoc.exists) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const student = studentDoc.data();
    const payload = JSON.stringify({
      universityId: student.universityId,
      studentDocId: studentId,
      timestamp: Date.now(),
    });

    const qrDataUrl = await QRCode.toDataURL(payload);

    res.json({ success: true, qrCode: qrDataUrl });
  } catch (error) {
    console.error('Generate QR error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

// -------------------- 3. Get All Students --------------------
app.get('/api/students', async (req, res) => {
  try {
    const { department, batch, search, page = 1, limit = 50 } = req.query;

    let query = db.collection(STUDENTS_COLLECTION);

    if (department && department !== 'all') query = query.where('department', '==', department);
    if (batch && batch !== 'all') query = query.where('batch', '==', batch);

    const snapshot = await query.get();
    let students = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    if (search) {
      const searchTerm = search.toLowerCase();
      students = students.filter(
        (s) =>
          s.fullName?.toLowerCase().includes(searchTerm) ||
          s.universityId?.toLowerCase().includes(searchTerm) ||
          s.email?.toLowerCase().includes(searchTerm)
      );
    }

    students.sort((a, b) => a.fullName?.localeCompare(b.fullName));

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedStudents = students.slice(startIndex, endIndex);

    res.json({
      success: true,
      students: paginatedStudents,
      total: students.length,
      page: parseInt(page),
      totalPages: Math.ceil(students.length / limit),
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

// -------------------- 4. Get Student by ID --------------------
app.get('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let studentDoc = await db.collection(STUDENTS_COLLECTION).doc(id).get();

    if (!studentDoc.exists) {
      const querySnapshot = await db.collection(STUDENTS_COLLECTION).where('universityId', '==', id).get();
      if (querySnapshot.empty) {
        return res.status(404).json({ success: false, message: 'Student not found' });
      }
      studentDoc = querySnapshot.docs[0];
    }

    res.json({ success: true, student: { id: studentDoc.id, ...studentDoc.data() } });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

// 🗑️ Delete a student
app.delete('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection('students').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    await docRef.delete();
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ✏️ Update a student
app.put('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const docRef = db.collection('students').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    await docRef.update(updates);
    res.json({ success: true, message: 'Student updated successfully' });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

 
// -------------------- 5. Verify Meal (Improved with Timestamp, Date & Analytics) --------------------
app.post("/api/verify-meal", async (req, res) => {
  try {
    const { qrData, mealType } = req.body;

    // ✅ Validation
    if (!qrData || !mealType) {
      return res
        .status(400)
        .json({ success: false, message: "qrData and mealType are required" });
    }

    // ✅ Parse QR data (supports JSON or plain text)
    let parsed;
    try {
      parsed = JSON.parse(qrData);
    } catch {
      parsed = { universityId: qrData.trim() };
    }

    const universityId = parsed.universityId;
    const studentDocId = parsed.studentDocId;
    if (!universityId)
      return res
        .status(400)
        .json({ success: false, message: "Invalid QR data - missing universityId" });

    // ✅ Find student by ID or universityId
    let studentDoc = studentDocId
      ? await db.collection(STUDENTS_COLLECTION).doc(studentDocId).get()
      : (await db
          .collection(STUDENTS_COLLECTION)
          .where("universityId", "==", universityId)
          .limit(1)
          .get()
        ).docs[0];

    if (!studentDoc?.exists) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    const studentData = studentDoc.data();
    const studentId = studentDoc.id;

    // ✅ Current Date & Timestamp
    const now = new Date();
    const currentDate = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const timestamp = admin.firestore.Timestamp.fromDate(now);

    // ------------------- 1. Denials Check -------------------
    const denialSnap = await db
      .collection(DENIALS_COLLECTION)
      .where("studentId", "==", studentId)
      .get();

    for (const ddoc of denialSnap.docs) {
      const d = ddoc.data();
      const deniedMeal = d.mealType || "all";
      const applies =
        (deniedMeal === "all" || deniedMeal === mealType) &&
        (!d.fromDate || d.fromDate <= currentDate) &&
        (!d.toDate || currentDate <= d.toDate);

      if (applies) {
        await db.collection(VERIFICATIONS_COLLECTION).add({
          studentId,
          universityId,
          mealType,
          date: currentDate,
          timestamp,
          status: "denied",
          studentName: studentData.fullName,
          department: studentData.department || "",
        });

        return res.status(403).json({
          success: false,
          message: `Access denied for ${mealType} (from ${d.fromDate || "-"} to ${
            d.toDate || "-"
          })`,
        });
      }
    }

    // ------------------- 2. Prevent Duplicate Verifications -------------------
    const existing = await db
      .collection(VERIFICATIONS_COLLECTION)
      .where("studentId", "==", studentId)
      .where("mealType", "==", mealType)
      .where("date", "==", currentDate)
      .get();

    if (!existing.empty) {
      return res.status(400).json({
        success: false,
        message: `Already verified for ${mealType} today`,
      });
    }

    // ------------------- 3. Record Successful Verification -------------------
    await db.collection(VERIFICATIONS_COLLECTION).add({
      studentId,
      universityId,
      studentName: studentData.fullName,
      department: studentData.department || "",
      batch: studentData.batch || "",
      mealType,
      date: currentDate,
      timestamp,
      status: "verified",
    });

    // ✅ Return success response
    return res.status(200).json({
      success: true,
      message: `✅ Meal verified for ${studentData.fullName}`,
      student: studentData,
      verifiedAt: now.toISOString(),
    });
  } catch (error) {
    console.error("❌ Verify meal error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// -------------------- 6. Statistics Endpoint --------------------
app.get('/api/statistics', async (req, res) => {
  try {
    const today = todayDateString();

    const studentsSnap = await db.collection(STUDENTS_COLLECTION).get();
    const verificationsSnap = await db.collection(VERIFICATIONS_COLLECTION).where('date', '==', today).get();
    const complaintsSnap = await db.collection(COMPLAINTS_COLLECTION).get();
    const denialsSnap = await db.collection(DENIALS_COLLECTION).get();

    const totalStudents = studentsSnap.size;
    const totalComplaints = complaintsSnap.size;
    const totalVerifications = verificationsSnap.size;
    const totalDenials = denialsSnap.size;

    const mealCounts = { breakfast: 0, lunch: 0, dinner: 0 };
    verificationsSnap.forEach((doc) => {
      const data = doc.data();
      if (mealCounts[data.mealType] !== undefined) mealCounts[data.mealType]++;
    });

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalComplaints,
        totalDenials,
        totalVerifications,
        mealCounts,
        date: today,
      },
    });
  } catch (error) {
    console.error('Statistics error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

// -------------------- 7. Health Check --------------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Meal Card Backend Running', timestamp: new Date().toISOString() });
});

// -------------------- 8. Default Route --------------------
app.get('/', (req, res) => {
  res.send(`
    <h1>Meal Card Control System API</h1>
    <p>Server is running ✅</p>
    <p>Endpoints: /api/register-student, /api/verify-meal, /api/students, /api/statistics</p>
  `);
});




// -------------------- Start Server --------------------
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
