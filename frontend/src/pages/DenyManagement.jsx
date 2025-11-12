// src/pages/DenyManagement.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase_connect';

const DenyManagement = () => {
  const [students, setStudents] = useState([]);
  const [deniedStudents, setDeniedStudents] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStudentsAndDeniedStatus();
  }, []);

  const fetchStudentsAndDeniedStatus = async () => {
    try {
      setLoading(true);
      
      // Fetch all students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('student_id, first_name, last_name, department')
        .order('first_name');

      if (studentsError) throw studentsError;

      // Fetch denied students
      const { data: deniedData, error: deniedError } = await supabase
        .from('denied_students')
        .select('student_id')
        .eq('is_active', true);

      if (deniedError) throw deniedError;

      // Create set of denied student IDs
      const deniedIds = new Set(deniedData.map(item => item.student_id));
      
      setStudents(studentsData);
      setDeniedStudents(deniedIds);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (studentId) => {
    setDeniedStudents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Get current denied students from database
      const { data: currentDenied, error: fetchError } = await supabase
        .from('denied_students')
        .select('student_id')
        .eq('is_active', true);

      if (fetchError) throw fetchError;

      const currentDeniedSet = new Set(currentDenied.map(item => item.student_id));
      
      // Students to add to denied list
      const toAdd = [...deniedStudents].filter(id => !currentDeniedSet.has(id));
      
      // Students to remove from denied list
      const toRemove = [...currentDeniedSet].filter(id => !deniedStudents.has(id));

      // Add new denied students
      if (toAdd.length > 0) {
        const { error: addError } = await supabase
          .from('denied_students')
          .insert(
            toAdd.map(studentId => ({
              student_id: studentId,
              reason: 'Manual denial by cafeteria manager'
            }))
          );

        if (addError) throw addError;
      }

      // Remove students from denied list
      if (toRemove.length > 0) {
        const { error: removeError } = await supabase
          .from('denied_students')
          .update({ is_active: false })
          .in('student_id', toRemove);

        if (removeError) throw removeError;
      }

      alert('Access permissions updated successfully!');
      
    } catch (error) {
      console.error('Error updating access permissions:', error);
      alert('Error updating access permissions: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSelectAll = () => {
    if (deniedStudents.size === students.length) {
      setDeniedStudents(new Set());
    } else {
      const allStudentIds = new Set(students.map(student => student.student_id));
      setDeniedStudents(allStudentIds);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Access Management</h1>
          <p className="text-gray-600">
            Manage student access to cafeteria services. Checked students will be denied access.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Student List ({students.length} students)
                </h2>
                <p className="text-sm text-gray-600">
                  {deniedStudents.size} students currently denied access
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleSelectAll}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {deniedStudents.size === students.length ? 'Deselect All' : 'Select All'}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-12 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deny
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.student_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={deniedStudents.has(student.student_id)}
                        onChange={() => handleCheckboxChange(student.student_id)}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.student_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.first_name} {student.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        deniedStudents.has(student.student_id)
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {deniedStudents.has(student.student_id) ? 'Denied' : 'Allowed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DenyManagement;

// // frontend/src/pages/DenyManagement.jsx
// import React, { useEffect, useState } from "react";
// import { api } from "../services/api";

// export default function DenyManagement() {
//   const [students, setStudents] = useState([]);
//   const [filtered, setFiltered] = useState([]);
//   const [selectedIds, setSelectedIds] = useState(new Set());
//   const [search, setSearch] = useState("");
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [mealType, setMealType] = useState("all");
//   const [loading, setLoading] = useState(true);
//   const [showDenied, setShowDenied] = useState(false);
//   const [denials, setDenials] = useState([]);
//   const [selectedDenialIds, setSelectedDenialIds] = useState(new Set());

//   useEffect(() => {
//     fetchStudents();
//   }, []);

//   useEffect(() => {
//     applySearch();
//   }, [students, search]);

//   const fetchStudents = async (page = 1) => {
//     setLoading(true);
//     try {
//       // grab large limit to allow client-side paging; adjust limit param if your backend supports real paging
//       const res = await api.get("/students?limit=1000");
//       if (res.data.success) {
//         setStudents(res.data.students || []);
//       } else {
//         alert("Failed to fetch students");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Failed to fetch students");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const applySearch = () => {
//     if (!search) {
//       setFiltered(students);
//       return;
//     }
//     const s = search.toLowerCase();
//     setFiltered(students.filter(st =>
//       (st.fullName && st.fullName.toLowerCase().includes(s)) ||
//       (st.universityId && st.universityId.toLowerCase().includes(s))
//     ));
//   };

//   const toggleSelect = (id) => {
//     const next = new Set(selectedIds);
//     if (next.has(id)) next.delete(id);
//     else next.add(id);
//     setSelectedIds(next);
//   };

//   const toggleSelectAll = () => {
//     if (selectedIds.size === filtered.length) {
//       setSelectedIds(new Set());
//     } else {
//       setSelectedIds(new Set(filtered.map(s => s.id)));
//     }
//   };

//   const denySelected = async () => {
//     if (selectedIds.size === 0) return alert("Select at least one student to deny");
//     if (!fromDate) return alert("Please select start (from) date");
//     if (!toDate) return alert("Please select end (to) date");
//     if (new Date(fromDate) > new Date(toDate)) return alert("From date must be <= To date");

//     const studentIds = Array.from(selectedIds);
//     try {
//       const res = await api.post("/deny-students", { studentIds, mealType, fromDate, toDate, note: `Manual denial by manager` });
//       if (res.data.success) {
//         alert("Denials created");
//         // clear selection
//         setSelectedIds(new Set());
//         // optionally refresh denials view
//         if (showDenied) fetchDenials();
//       } else {
//         alert("Failed to create denials");
//       }
//     } catch (err) {
//       console.error(err);
//       alert(err.response?.data?.message || "Failed to create denials");
//     }
//   };

//   const fetchDenials = async () => {
//     try {
//       const res = await api.get("/denials?activeOnly=true&limit=500");
//       if (res.data.success) {
//         setDenials(res.data.denials || []);
//       } else {
//         alert("Failed to fetch denials");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Failed to fetch denials");
//     }
//   };

//   const toggleShowDenied = async () => {
//     const next = !showDenied;
//     setShowDenied(next);
//     if (next) {
//       await fetchDenials();
//     }
//   };

//   const toggleSelectDenial = (id) => {
//     const next = new Set(selectedDenialIds);
//     if (next.has(id)) next.delete(id);
//     else next.add(id);
//     setSelectedDenialIds(next);
//   };

//   const releaseSelectedDenials = async () => {
//     if (selectedDenialIds.size === 0) return alert("Select at least one denial to release");
//     const ids = Array.from(selectedDenialIds);
//     try {
//       const res = await api.post("/denials/release", { ids });
//       if (res.data.success) {
//         alert("Released selected denials");
//         setSelectedDenialIds(new Set());
//         fetchDenials();
//       } else {
//         alert("Failed to release denials");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Failed to release denials");
//     }
//   };

//   if (loading) return <div className="p-4">Loading students...</div>;

//   return (
//     <div className="p-4">
//       <h1 className="text-2xl font-bold mb-4">Deny / Release Students (Manager)</h1>

//       <div className="flex items-center gap-3 mb-3">
//         <input
//           type="text"
//           placeholder="Search name or university ID..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="border p-2 rounded w-80"
//         />
//         <label className="flex items-center gap-2">
//           From: <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border p-1 rounded" />
//         </label>
//         <label className="flex items-center gap-2">
//           To: <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border p-1 rounded" />
//         </label>
//         <select value={mealType} onChange={(e) => setMealType(e.target.value)} className="border p-2 rounded">
//           <option value="all">All Meals</option>
//           <option value="breakfast">Breakfast</option>
//           <option value="lunch">Lunch</option>
//           <option value="dinner">Dinner</option>
//         </select>

//         <button onClick={denySelected} className="bg-red-600 text-white px-3 py-1 rounded">Deny Selected</button>
//         <button onClick={toggleShowDenied} className="bg-gray-700 text-white px-3 py-1 rounded">{showDenied ? 'Hide Denied' : 'Show Denied'}</button>
//       </div>

//       {!showDenied && (
//         <div>
//           <table className="min-w-full bg-white border">
//             <thead>
//               <tr>
//                 <th className="border p-2"><input type="checkbox" onChange={toggleSelectAll} checked={selectedIds.size === filtered.length && filtered.length > 0} /></th>
//                 <th className="border p-2">Full Name</th>
//                 <th className="border p-2">University ID</th>
//                 <th className="border p-2">Department</th>
//                 <th className="border p-2">Batch</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filtered.map(s => (
//                 <tr key={s.id} className="odd:bg-gray-50">
//                   <td className="border p-2 text-center"><input type="checkbox" checked={selectedIds.has(s.id)} onChange={() => toggleSelect(s.id)} /></td>
//                   <td className="border p-2">{s.fullName}</td>
//                   <td className="border p-2">{s.universityId}</td>
//                   <td className="border p-2">{s.department}</td>
//                   <td className="border p-2">{s.batch}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {showDenied && (
//         <div className="mt-4">
//           <div className="flex gap-2 mb-2">
//             <button onClick={releaseSelectedDenials} className="bg-green-600 text-white px-3 py-1 rounded">Release Selected</button>
//             <button onClick={() => { setSelectedDenialIds(new Set()); fetchDenials(); }} className="bg-gray-500 text-white px-3 py-1 rounded">Refresh</button>
//           </div>

//           <table className="min-w-full bg-white border">
//             <thead>
//               <tr>
//                 <th className="border p-2"><input type="checkbox" onChange={(e) => {
//                   if (e.target.checked) setSelectedDenialIds(new Set(denials.map(d => d.id)));
//                   else setSelectedDenialIds(new Set());
//                 }} checked={selectedDenialIds.size === denials.length && denials.length > 0} /></th>
//                 <th className="border p-2">Full Name</th>
//                 <th className="border p-2">University ID</th>
//                 <th className="border p-2">Meal</th>
//                 <th className="border p-2">From</th>
//                 <th className="border p-2">To</th>
//                 <th className="border p-2">Note</th>
//                 <th className="border p-2">Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {denials.map(d => (
//                 <tr key={d.id} className="odd:bg-gray-50">
//                   <td className="border p-2 text-center"><input type="checkbox" checked={selectedDenialIds.has(d.id)} onChange={() => toggleSelectDenial(d.id)} /></td>
//                   <td className="border p-2">{d.fullName}</td>
//                   <td className="border p-2">{d.universityId}</td>
//                   <td className="border p-2">{d.mealType}</td>
//                   <td className="border p-2">{d.fromDate}</td>
//                   <td className="border p-2">{d.toDate}</td>
//                   <td className="border p-2">{d.note}</td>
//                   <td className="border p-2">
//                     <button onClick={async () => {
//                       if (!confirm('Release this denial?')) return;
//                       try {
//                         await api.delete(`/denials/${d.id}`);
//                         alert('Released');
//                         fetchDenials();
//                       } catch (err) {
//                         console.error(err);
//                         alert('Failed to release');
//                       }
//                     }} className="bg-yellow-600 px-2 py-1 text-white rounded">Release</button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }
