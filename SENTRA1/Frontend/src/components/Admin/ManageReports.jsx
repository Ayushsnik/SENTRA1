import React, { useState, useEffect } from 'react';
import { Search, Edit, Save, X, FileImage, ExternalLink } from 'lucide-react';

const ManageReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ status: '', category: '', priority: '' });
  const [editingReport, setEditingReport] = useState(null);
  const [updateData, setUpdateData] = useState({
    status: '',
    priority: '',
    note: '',
    resolution: '',
  });
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      // Build query params
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.category) params.append('category', filters.category);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/admin/incidents?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }

      const data = await response.json();
      console.log('✅ Fetched reports:', data.length);
      console.log('📎 Sample report:', data[0]);
      setReports(data);
    } catch (error) {
      console.error('❌ Failed to fetch reports:', error);
      alert('Failed to fetch reports: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (report) => {
    setEditingReport(report._id);
    setUpdateData({
      status: report.status,
      priority: report.priority,
      note: '',
      resolution: report.resolution || '',
    });
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/admin/incidents/${editingReport}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('Failed to update report');
      }

      alert('Report updated successfully');
      setEditingReport(null);
      fetchReports();
    } catch (error) {
      console.error('❌ Failed to update:', error);
      alert('Failed to update report');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: 'bg-yellow-100 text-yellow-800',
      'In Review': 'bg-blue-100 text-blue-800',
      Resolved: 'bg-green-100 text-green-800',
      Closed: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredReports = reports.filter(report =>
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.referenceId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Reports</h1>

        {/* Search and Filters */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Review">In Review</option>
            <option value="Resolved">Resolved</option>
          </select>
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Priority</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        {/* Reports Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No reports found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div key={report._id} className="border border-gray-200 rounded-lg p-5">
                {editingReport === report._id ? (
                  /* Edit Mode */
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                          value={updateData.status}
                          onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg"
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Review">In Review</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                        <select
                          value={updateData.priority}
                          onChange={(e) => setUpdateData({ ...updateData, priority: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Critical">Critical</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Admin Note</label>
                      <textarea
                        value={updateData.note}
                        onChange={(e) => setUpdateData({ ...updateData, note: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg"
                        rows={3}
                        placeholder="Add a note..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Resolution</label>
                      <textarea
                        value={updateData.resolution}
                        onChange={(e) => setUpdateData({ ...updateData, resolution: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg"
                        rows={3}
                        placeholder="Resolution details..."
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleUpdate}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Save size={16} className="mr-2" />
                        Save Changes
                      </button>
                      <button
                        onClick={() => setEditingReport(null)}
                        className="flex items-center px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                      >
                        <X size={16} className="mr-2" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{report.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Ref: {report.referenceId} | {report.category}
                        </p>
                        {report.reportedBy && (
                          <p className="text-sm text-gray-500 mt-1">
                            Reported by: {report.reportedBy.name || 'User'} ({report.reportedBy.email || 'N/A'})
                          </p>
                        )}
                        {report.isAnonymous && (
                          <p className="text-sm text-gray-500 mt-1">
                            📋 Anonymous Report
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                        <button
                          onClick={() => handleEdit(report)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                        >
                          <Edit size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-3">{report.description}</p>
                    
                    {/* Image Attachments Display */}
                    {report.attachments && report.attachments.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <FileImage size={16} className="text-gray-600" />
                          <h4 className="text-sm font-medium text-gray-700">
                            Attachments ({report.attachments.length})
                          </h4>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {report.attachments.map((attachment, idx) => (
                            <div key={idx} className="relative group">
                              <img
                                src={attachment.path}
                                alt={attachment.filename}
                                className="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-75 transition"
                                onClick={() => setSelectedImage(attachment.path)}
                                onError={(e) => {
                                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                                }}
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 rounded-b-lg truncate">
                                {attachment.filename}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>Priority: <span className="font-medium">{report.priority}</span></div>
                      <div>Location: <span className="font-medium">{report.location || 'N/A'}</span></div>
                      <div>Date: <span className="font-medium">{new Date(report.incidentDate).toLocaleDateString()}</span></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <X size={32} />
            </button>
            <img
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-[85vh] rounded-lg"
            />
            <a
              href={selectedImage}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-4 right-4 bg-white text-blue-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={16} />
              Open Full Size
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageReports;