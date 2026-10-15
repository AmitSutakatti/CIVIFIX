import { useState, useEffect } from 'react';
import { X, Download, Edit2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { downloadComplaintLetter } from '../utils/complaintLetter';

const LetterPreview = ({ 
  isOpen, 
  onClose, 
  letter, 
  onApprove, 
  onEdit,
  category,
  description,
  user,
  location
}) => {
  const [editedLetter, setEditedLetter] = useState(letter);
  const [isEditing, setIsEditing] = useState(false);

  // Update editedLetter when letter prop changes
  useEffect(() => {
    setEditedLetter(letter);
  }, [letter]);

  if (!isOpen) return null;

  const handleDownload = () => {
    downloadComplaintLetter(editedLetter);
    toast.success('Letter downloaded successfully!');
  };

  const handleSaveEdit = () => {
    onEdit(editedLetter);
    setIsEditing(false);
    toast.success('Letter updated');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Generated Complaint Letter</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="btn-secondary flex items-center space-x-2"
              title="Download as Word"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isEditing ? (
            <textarea
              value={editedLetter}
              onChange={(e) => setEditedLetter(e.target.value)}
              className="w-full h-full min-h-[400px] p-4 border border-gray-300 rounded-lg font-serif text-sm leading-relaxed"
              style={{ fontFamily: 'Times New Roman, serif' }}
            />
          ) : (
            <div className="bg-white p-8 border border-gray-200 rounded-lg font-serif text-sm leading-relaxed whitespace-pre-wrap">
              {editedLetter}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => {
              if (isEditing) {
                handleSaveEdit();
              } else {
                setIsEditing(true);
              }
            }}
            className="btn-secondary flex items-center space-x-2"
          >
            {isEditing ? (
              <>
                <Check className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            ) : (
              <>
                <Edit2 className="w-4 h-4" />
                <span>Edit Letter</span>
              </>
            )}
          </button>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onApprove(editedLetter);
                onClose();
              }}
              className="btn-primary"
            >
              Approve & Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LetterPreview;

