// frontend/src/pages/DenyManagement.jsx
import React, { useEffect, useState } from "react";
import { api } from "../services/api";

export default function DenyManagement() {
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [mealType, setMealType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showDenied, setShowDenied] = useState(false);
  const [denials, setDenials] = useState([]);
  const [selectedDenialIds, setSelectedDenialIds] = useState(new Set());

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    applySearch();
  }, [students, search]);

  const fetchStudents = async (page = 1) => {
    setLoading(true);
    try {
      // grab large limit to allow client-side paging; adjust limit param if your backend supports real paging
      const res = await api.get("/students?limit=1000");
      if (res.data.success) {
        setStudents(res.data.students || []);
      } else {
        alert("Failed to fetch students");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  const applySearch = () => {
    if (!search) {
      setFiltered(students);
      return;
    }
    const s = search.toLowerCase();
    setFiltered(students.filter(st =>
      (st.fullName && st.fullName.toLowerCase().includes(s)) ||
      (st.universityId && st.universityId.toLowerCase().includes(s))
    ));
  };

  const toggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(s => s.id)));
    }
  };

  const denySelected = async () => {
    if (selectedIds.size === 0) return alert("Select at least one student to deny");
    if (!fromDate) return alert("Please select start (from) date");
    if (!toDate) return alert("Please select end (to) date");
    if (new Date(fromDate) > new Date(toDate)) return alert("From date must be <= To date");

    const studentIds = Array.from(selectedIds);
    try {
      const res = await api.post("/deny-students", { studentIds, mealType, fromDate, toDate, note: `Manual denial by manager` });
      if (res.data.success) {
        alert("Denials created");
        // clear selection
        setSelectedIds(new Set());
        // optionally refresh denials view
        if (showDenied) fetchDenials();
      } else {
        alert("Failed to create denials");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create denials");
    }
  };

  const fetchDenials = async () => {
    try {
      const res = await api.get("/denials?activeOnly=true&limit=500");
      if (res.data.success) {
        setDenials(res.data.denials || []);
      } else {
        alert("Failed to fetch denials");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to fetch denials");
    }
  };

  const toggleShowDenied = async () => {
    const next = !showDenied;
    setShowDenied(next);
    if (next) {
      await fetchDenials();
    }
  };

  const toggleSelectDenial = (id) => {
    const next = new Set(selectedDenialIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedDenialIds(next);
  };

  const releaseSelectedDenials = async () => {
    if (selectedDenialIds.size === 0) return alert("Select at least one denial to release");
    const ids = Array.from(selectedDenialIds);
    try {
      const res = await api.post("/denials/release", { ids });
      if (res.data.success) {
        alert("Released selected denials");
        setSelectedDenialIds(new Set());
        fetchDenials();
      } else {
        alert("Failed to release denials");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to release denials");
    }
  };

  if (loading) return <div className="p-4">Loading students...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Deny / Release Students (Manager)</h1>

      <div className="flex items-center gap-3 mb-3">
        <input
          type="text"
          placeholder="Search name or university ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-80"
        />
        <label className="flex items-center gap-2">
          From: <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border p-1 rounded" />
        </label>
        <label className="flex items-center gap-2">
          To: <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border p-1 rounded" />
        </label>
        <select value={mealType} onChange={(e) => setMealType(e.target.value)} className="border p-2 rounded">
          <option value="all">All Meals</option>
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
        </select>

        <button onClick={denySelected} className="bg-red-600 text-white px-3 py-1 rounded">Deny Selected</button>
        <button onClick={toggleShowDenied} className="bg-gray-700 text-white px-3 py-1 rounded">{showDenied ? 'Hide Denied' : 'Show Denied'}</button>
      </div>

      {!showDenied && (
        <div>
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="border p-2"><input type="checkbox" onChange={toggleSelectAll} checked={selectedIds.size === filtered.length && filtered.length > 0} /></th>
                <th className="border p-2">Full Name</th>
                <th className="border p-2">University ID</th>
                <th className="border p-2">Department</th>
                <th className="border p-2">Batch</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="odd:bg-gray-50">
                  <td className="border p-2 text-center"><input type="checkbox" checked={selectedIds.has(s.id)} onChange={() => toggleSelect(s.id)} /></td>
                  <td className="border p-2">{s.fullName}</td>
                  <td className="border p-2">{s.universityId}</td>
                  <td className="border p-2">{s.department}</td>
                  <td className="border p-2">{s.batch}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showDenied && (
        <div className="mt-4">
          <div className="flex gap-2 mb-2">
            <button onClick={releaseSelectedDenials} className="bg-green-600 text-white px-3 py-1 rounded">Release Selected</button>
            <button onClick={() => { setSelectedDenialIds(new Set()); fetchDenials(); }} className="bg-gray-500 text-white px-3 py-1 rounded">Refresh</button>
          </div>

          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="border p-2"><input type="checkbox" onChange={(e) => {
                  if (e.target.checked) setSelectedDenialIds(new Set(denials.map(d => d.id)));
                  else setSelectedDenialIds(new Set());
                }} checked={selectedDenialIds.size === denials.length && denials.length > 0} /></th>
                <th className="border p-2">Full Name</th>
                <th className="border p-2">University ID</th>
                <th className="border p-2">Meal</th>
                <th className="border p-2">From</th>
                <th className="border p-2">To</th>
                <th className="border p-2">Note</th>
                <th className="border p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {denials.map(d => (
                <tr key={d.id} className="odd:bg-gray-50">
                  <td className="border p-2 text-center"><input type="checkbox" checked={selectedDenialIds.has(d.id)} onChange={() => toggleSelectDenial(d.id)} /></td>
                  <td className="border p-2">{d.fullName}</td>
                  <td className="border p-2">{d.universityId}</td>
                  <td className="border p-2">{d.mealType}</td>
                  <td className="border p-2">{d.fromDate}</td>
                  <td className="border p-2">{d.toDate}</td>
                  <td className="border p-2">{d.note}</td>
                  <td className="border p-2">
                    <button onClick={async () => {
                      if (!confirm('Release this denial?')) return;
                      try {
                        await api.delete(`/denials/${d.id}`);
                        alert('Released');
                        fetchDenials();
                      } catch (err) {
                        console.error(err);
                        alert('Failed to release');
                      }
                    }} className="bg-yellow-600 px-2 py-1 text-white rounded">Release</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
