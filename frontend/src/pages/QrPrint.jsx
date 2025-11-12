// src/pages/QrPrint.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase_connect';

const QrPrint = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select('student_id, first_name, middle_name, last_name, department, year, qr_code')
        .order('first_name');

      if (error) throw error;
      
      // Generate QR codes for students who don't have them
      const studentsWithQR = data.map(student => ({
        ...student,
        qr_code: student.qr_code || generateQRCode(student.student_id, student.first_name, student.last_name)
      }));
      
      setStudents(studentsWithQR || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = (studentId, firstName, lastName) => {
    const qrData = JSON.stringify({
      studentId: studentId,
      name: `${firstName} ${lastName}`,
      type: "meal_card",
      timestamp: new Date().toISOString()
    });
    
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
  };

  const handleCheckboxChange = (studentId) => {
    setSelectedStudents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedStudents.size === students.length) {
      setSelectedStudents(new Set());
    } else {
      const allStudentIds = new Set(students.map(student => student.student_id));
      setSelectedStudents(allStudentIds);
    }
  };

  const handlePrint = () => {
    if (selectedStudents.size === 0) {
      alert('Please select at least one student to print');
      return;
    }
    window.print();
  };

  const filteredStudents = students.filter(student =>
    student.first_name?.toLowerCase().includes(filter.toLowerCase()) ||
    student.last_name?.toLowerCase().includes(filter.toLowerCase()) ||
    student.student_id?.toLowerCase().includes(filter.toLowerCase()) ||
    student.department?.toLowerCase().includes(filter.toLowerCase())
  );

  const studentsToPrint = filteredStudents.filter(student => 
    selectedStudents.has(student.student_id)
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">QR Code Printing</h1>
          <p className="text-gray-600">Select students to print their QR codes for meal scanning</p>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSelectAll}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                {selectedStudents.size === students.length ? 'Deselect All' : 'Select All'}
              </button>
              <button
                onClick={handlePrint}
                disabled={selectedStudents.size === 0}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
              >
                Print Selected ({selectedStudents.size})
              </button>
            </div>
            <div className="flex-1 md:max-w-xs">
              <input
                type="text"
                placeholder="Search students..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Student Selection Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">
              Student Selection ({filteredStudents.length} students found)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-12 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Select
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
                    QR Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.student_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedStudents.has(student.student_id)}
                        onChange={() => handleCheckboxChange(student.student_id)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.student_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.first_name} {student.middle_name} {student.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        student.qr_code 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {student.qr_code ? 'Available' : 'Missing'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Printable QR Codes */}
        <div className="print:block hidden">
          {studentsToPrint.map((student, index) => (
            <div key={student.student_id} className="break-after-page mb-8 print:mb-0">
              <div className="bg-white p-8 border-2 border-gray-300 rounded-lg print:border-none print:shadow-none max-w-md mx-auto">
                {/* Header */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Meal Card</h2>
                  <p className="text-gray-600">Mekelle University</p>
                </div>

                {/* Student Info */}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {student.first_name} {student.last_name}
                  </h3>
                  <p className="text-gray-600">ID: {student.student_id}</p>
                  <p className="text-gray-600">Department: {student.department}</p>
                  {student.year && (
                    <p className="text-gray-600">Batch: {new Date(student.year).getFullYear()}</p>
                  )}
                </div>

                {/* QR Code */}
                <div className="flex justify-center mb-6">
                  <div className="border-2 border-gray-400 p-4 rounded-lg">
                    <img 
                      src={student.qr_code} 
                      alt={`QR Code for ${student.first_name} ${student.last_name}`}
                      className="w-64 h-64 mx-auto"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = generateQRCode(student.student_id, student.first_name, student.last_name);
                      }}
                    />
                  </div>
                </div>

                {/* Instructions */}
                <div className="text-center text-sm text-gray-500 mt-4">
                  <p>Present this card at the cafeteria for meal scanning</p>
                  <p>Valid for current academic year</p>
                </div>

                {/* Footer */}
                <div className="text-center text-xs text-gray-400 mt-6 pt-4 border-t border-gray-300">
                  <p>Printed on: {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Print Styles */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .print\\:block,
            .print\\:block * {
              visibility: visible;
            }
            .print\\:block {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .break-after-page {
              break-after: page;
            }
            .print\\:mb-0 {
              margin-bottom: 0 !important;
            }
            .print\\:border-none {
              border: none !important;
            }
            .print\\:shadow-none {
              box-shadow: none !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default QrPrint;