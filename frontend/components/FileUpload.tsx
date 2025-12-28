'use client';

import { useState } from 'react';

interface FileUploadProps {
  patientId: string;
  accessToken: string;
  onSuccess?: () => void;
}

export default function FileUpload({ patientId, accessToken, onSuccess }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
      setMessage({ type: '', text: '' });
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (files.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one file to upload' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();

      // Append all files
      files.forEach((file) => {
        formData.append('files', file);
      });

      formData.append('description', description);
      formData.append('accessToken', accessToken);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/patients/${patientId}/files`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: data.message || 'Files uploaded successfully!' });
        setFiles([]);
        setDescription('');
        // Reset file input
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        if (onSuccess) onSuccess();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to upload files' });
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      setMessage({ type: 'error', text: 'An error occurred while uploading files' });
    } finally {
      setLoading(false);
    }
  };

  const totalSize = files.reduce((acc, file) => acc + file.size, 0);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Medical Reports</h3>

      {message.text && (
        <div
          className={`mb-4 p-3 rounded ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Files (Multiple pages supported)
          </label>
          {/* Hidden file input */}
          <input
            id="file-input"
            type="file"
            onChange={handleFileChange}
            accept="image/*,.pdf"
            multiple
            className="hidden"
          />
          {/* Custom button to trigger file input */}
          <label
            htmlFor="file-input"
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-md hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="text-sm text-gray-600">
              {files.length > 0 ? 'Add More Files' : 'Choose Files'}
            </span>
          </label>
          <p className="mt-1 text-sm text-gray-500">
            Accepted formats: Images (JPG, PNG) and PDF files. You can select multiple files at once.
          </p>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">
              Selected files ({files.length}):
            </p>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200"
                >
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="ml-4 px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Total size: {(totalSize / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Brief description of the reports (e.g., Blood test results from 2024)..."
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || files.length === 0}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Uploading...' : `Upload ${files.length} File${files.length !== 1 ? 's' : ''}`}
          </button>

          {files.length > 0 && !loading && (
            <button
              type="button"
              onClick={() => {
                setFiles([]);
                const fileInput = document.getElementById('file-input') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
