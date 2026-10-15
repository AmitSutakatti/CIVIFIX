import { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../services/api';
import toast from 'react-hot-toast';
import { X, Send, Paperclip, Image as ImageIcon } from 'lucide-react';

const ChatModal = ({ complaint, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    markAsRead();
    
    // Auto-refresh messages every 3 seconds
    const interval = setInterval(() => {
      fetchMessages();
    }, 3000);

    return () => clearInterval(interval);
  }, [complaint._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const response = await chatAPI.getChatMessages(complaint._id);
      setMessages(response.data.data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markAsRead = async () => {
    try {
      await chatAPI.markMessagesRead(complaint._id);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Validate file count (max 5)
    if (files.length + selectedFiles.length > 5) {
      toast.error('Maximum 5 files allowed');
      return;
    }

    // Validate file size (max 10MB each)
    const invalidFiles = selectedFiles.filter(file => file.size > 10 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      toast.error('Each file must be less than 10MB');
      return;
    }

    setFiles([...files, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() && files.length === 0) {
      return;
    }

    setSending(true);

    try {
      const formData = new FormData();
      formData.append('message', newMessage);
      
      files.forEach((file) => {
        formData.append('files', file);
      });

      await chatAPI.sendMessage(complaint._id, formData);
      
      setNewMessage('');
      setFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Refresh messages
      fetchMessages();
      toast.success('Message sent');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message');
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isImage = (url) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Chat - Project #{complaint._id.toString().slice(-6)}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {complaint.category} • {complaint.assignedContractor?.name || 'Contractor'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${message.sender.role === 'MUNICIPAL_OFFICER' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-4 ${
                    message.sender.role === 'MUNICIPAL_OFFICER'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-sm">
                      {message.sender.name}
                    </span>
                    <span className={`text-xs ${message.sender.role === 'MUNICIPAL_OFFICER' ? 'text-blue-100' : 'text-gray-600'}`}>
                      {formatTime(message.createdAt)}
                    </span>
                  </div>
                  {message.message && (
                    <p className="text-sm mb-2">{message.message}</p>
                  )}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {message.attachments.map((attachment, idx) => (
                        <div key={idx} className="rounded overflow-hidden">
                          {isImage(attachment.url) ? (
                            <img
                              src={`http://localhost:8000${attachment.url}`}
                              alt={`Attachment ${idx + 1}`}
                              className="max-w-full h-auto rounded"
                            />
                          ) : (
                            <a
                              href={`http://localhost:8000${attachment.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-2 p-2 bg-black bg-opacity-20 rounded hover:bg-opacity-30"
                            >
                              <Paperclip className="w-4 h-4" />
                              <span className="text-sm truncate">{attachment.filename}</span>
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* File Preview */}
        {files.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-wrap gap-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg p-2"
                >
                  {file.type.startsWith('image/') ? (
                    <ImageIcon className="w-4 h-4 text-gray-600" />
                  ) : (
                    <Paperclip className="w-4 h-4 text-gray-600" />
                  )}
                  <span className="text-sm text-gray-700 truncate max-w-xs">
                    {file.name}
                  </span>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-6 border-t border-gray-200">
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="input-field w-full resize-none"
                rows="2"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="file-input"
                accept="image/*,.pdf,.doc,.docx"
              />
              <label
                htmlFor="file-input"
                className="p-2 text-gray-600 hover:text-gray-800 cursor-pointer border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Paperclip className="w-5 h-5" />
              </label>
              <button
                type="submit"
                disabled={sending || (!newMessage.trim() && files.length === 0)}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Max 5 files, 10MB each. Supported: Images, PDF, DOC, DOCX
          </p>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;















