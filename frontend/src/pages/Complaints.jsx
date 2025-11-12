// src/pages/Complaints.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase_connect';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(null);
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('complaints')
        .select(`
          *,
          students (
            first_name,
            last_name,
            student_id,
            department
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComplaints(data || []);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (complaintId) => {
    if (!responseText.trim()) {
      alert('Please enter a response');
      return;
    }

    try {
      setResponding(complaintId);
      
      const { error } = await supabase
        .from('complaints')
        .update({
          response: responseText,
          status: 'resolved',
          resolved_at: new Date().toISOString()
        })
        .eq('id', complaintId);

      if (error) throw error;

      setResponseText('');
      setResponding(null);
      fetchComplaints();
      alert('Response sent successfully!');
      
    } catch (error) {
      console.error('Error sending response:', error);
      alert('Error sending response: ' + error.message);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      in_progress: { color: 'bg-blue-100 text-blue-800', label: 'In Progress' },
      resolved: { color: 'bg-green-100 text-green-800', label: 'Resolved' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Complaints</h1>
          <p className="text-gray-600">Manage and respond to student complaints and feedback</p>
        </div>

        <div className="space-y-6">
          {complaints.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500 text-lg">No complaints found</p>
            </div>
          ) : (
            complaints.map((complaint) => (
              <div key={complaint.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {complaint.students?.first_name} {complaint.students?.last_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {complaint.students?.student_id} • {complaint.students?.department}
                      </p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(complaint.status)}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(complaint.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                      {complaint.message}
                    </p>
                  </div>

                  {complaint.response ? (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-green-800">Your Response</span>
                        <span className="text-xs text-green-600">
                          {new Date(complaint.resolved_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-green-700">{complaint.response}</p>
                    </div>
                  ) : (
                    <div>
                      <textarea
                        value={responding === complaint.id ? responseText : ''}
                        onChange={(e) => setResponseText(e.target.value)}
                        onFocus={() => setResponding(complaint.id)}
                        placeholder="Type your response here..."
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      {responding === complaint.id && (
                        <div className="flex justify-end space-x-2 mt-2">
                          <button
                            onClick={() => {
                              setResponding(null);
                              setResponseText('');
                            }}
                            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleResponse(complaint.id)}
                            disabled={!responseText.trim()}
                            className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
                          >
                            Send Response
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Complaints;