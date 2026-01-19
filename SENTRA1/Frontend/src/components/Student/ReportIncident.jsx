import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { incidentsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FileText, Upload, AlertCircle, X, File } from 'lucide-react';

const ReportIncident = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Harassment',
    description: '',
    location: '',
    incidentDate: '',
    witnesses: '',
    isAnonymous: false,
    anonymousContact: '',
  });
  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  const categories = [
    'Harassment',
    'Bullying',
    'Discrimination',
    'Safety Concern',
    'Academic Misconduct',
    'Substance Abuse',
    'Mental Health',
    'Physical Violence',
    'Theft',
    'Other',
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const validateFile = (file) => {
    const maxSize = 5 * 1024 * 1024;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    
    if (file.size > maxSize) {
      toast.error(`${file.name} is too large. Max size is 5MB.`);
      return false;
    }
    
    if (!allowedTypes.includes(file.type)) {
      toast.error(`${file.name} is not a supported file type.`);
      return false;
    }
    
    return true;
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    addFiles(selectedFiles);
  };

  const addFiles = (selectedFiles) => {
    if (files.length + selectedFiles.length > 5) {
      toast.error('Maximum 5 files allowed');
      return;
    }

    const validFiles = selectedFiles.filter(validateFile);
    const newFiles = [...files, ...validFiles];
    setFiles(newFiles);

    const newPreviews = [...filePreviews];
    validFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push({
            file: file,
            preview: reader.result,
            type: 'image'
          });
          setFilePreviews([...newPreviews]);
        };
        reader.readAsDataURL(file);
      } else {
        newPreviews.push({
          file: file,
          preview: null,
          type: 'document'
        });
        setFilePreviews([...newPreviews]);
      }
    });
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = filePreviews.filter((_, i) => i !== index);
    setFiles(newFiles);
    setFilePreviews(newPreviews);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create FormData
      const submitData = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });

      // Add files
      files.forEach(file => {
        submitData.append('attachments', file);
      });

      // 🔍 DEBUG LOGS
      console.log('📤 Submitting incident:');
      console.log('- Title:', formData.title);
      console.log('- Category:', formData.category);
      console.log('- Files:', files.length);
      console.log('- IsAnonymous:', formData.isAnonymous);
      
      // ✅ USE YOUR API SERVICE
      const { data } = await incidentsAPI.create(submitData);
      
      console.log('✅ Success:', data);
      
      toast.success(`Report submitted successfully! Reference ID: ${data.incident.referenceId}`);
      
      // Reset form
      setFormData({
        title: '',
        category: 'Harassment',
        description: '',
        location: '',
        incidentDate: '',
        witnesses: '',
        isAnonymous: false,
        anonymousContact: '',
      });
      setFiles([]);
      setFilePreviews([]);
      
      // Navigate after 2 seconds
      setTimeout(() => navigate('/my-reports'), 2000);
      
    } catch (error) {
      console.error('❌ Submit error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <FileText className="text-blue-600" size={32} />
          <h1 className="text-3xl font-bold text-gray-800">Report an Incident</h1>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="text-blue-600 mr-3 flex-shrink-0" size={20} />
            <p className="text-sm text-blue-800">
              All reports are treated with confidentiality. You can choose to remain anonymous. 
              Your report will be reviewed by our team and you'll receive updates on its status.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Anonymous Toggle */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isAnonymous"
              name="isAnonymous"
              checked={formData.isAnonymous}
              onChange={handleChange}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="isAnonymous" className="text-gray-700 font-medium">
              Submit Anonymously
            </label>
          </div>

          {formData.isAnonymous && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Anonymous Contact (Optional)
              </label>
              <input
                type="text"
                name="anonymousContact"
                value={formData.anonymousContact}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Email or phone for updates (optional)"
              />
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Incident Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief title of the incident"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="6"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Provide detailed information about the incident..."
            />
          </div>

          {/* Location and Date */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Where did this occur?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Incident Date *
              </label>
              <input
                type="date"
                name="incidentDate"
                value={formData.incidentDate}
                onChange={handleChange}
                required
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Witnesses */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Witnesses (Optional)
            </label>
            <input
              type="text"
              name="witnesses"
              value={formData.witnesses}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Names of any witnesses"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachments (Optional)
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto text-gray-400 mb-2" size={40} />
              <input
                type="file"
                onChange={handleFileChange}
                multiple
                accept="image/*,.pdf"
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-blue-600 hover:text-blue-700">Upload files</span>
                <span className="text-gray-600"> or drag and drop</span>
              </label>
              <p className="text-xs text-gray-500 mt-2">
                PNG, JPG, PDF up to 5MB (Max 5 files)
              </p>
            </div>

            {/* File Previews */}
            {filePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                {filePreviews.map((item, index) => (
                  <div key={index} className="relative group">
                    {item.type === 'image' ? (
                      <img
                        src={item.preview}
                        alt={item.file.name}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                    ) : (
                      <div className="w-full h-32 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200">
                        <File className="text-gray-400" size={40} />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      <X size={16} />
                    </button>
                    <p className="text-xs text-gray-600 mt-1 truncate">
                      {item.file.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {(item.file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportIncident;