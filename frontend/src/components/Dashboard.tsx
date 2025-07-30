import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit3 } from 'lucide-react';
import { toast } from 'react-toastify';
import { notesAPI } from '../services/api';
import type { User as UserType, Note } from '../types';
import topImage from '../assets/images/top.png';
import type {ApiError} from '../types';  

interface DashboardProps {
  user: UserType;
  onLogout: () => void;
}

function Dashboard({ user, onLogout }: DashboardProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Fixed: Replace 'any' with proper error type
  const extractErrorMessage = (error: ApiError) => {
    console.log('Full error object:', error);
    
    // First priority: Backend error message
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    
    // Second priority: Backend error field
    if (error?.response?.data?.error) {
      return error.response.data.error;
    }
    
    // Third priority: Custom error message
    if (error?.message) {
      return error.message;
    }
    
    // Fourth priority: HTTP status with any available message
    if (error?.response?.status) {
      const statusMessage = error?.response?.data?.message || 
                           error?.response?.data?.error || 
                           error?.response?.statusText || 
                           'Something went wrong';
      return `${statusMessage}`;
    }
    
    // Network errors
    if (error?.code === 'NETWORK_ERROR' || error?.name === 'NetworkError') {
      return 'Network connection failed. Please check your internet connection.';
    }
    
    // Final fallback
    return 'An unexpected error occurred. Please try again.';
  };

  // Fixed: Wrap loadNotes with useCallback to prevent dependency issues
  const loadNotes = useCallback(async () => {
    try {
      const response = await notesAPI.getNotes();
      setNotes(response.notes || []);
    } catch (error) {
      const errorMessage = extractErrorMessage(error as ApiError);
      toast.error(errorMessage);
      console.error('Load Notes Error:', error);
    }
  }, []); 

  useEffect(() => {
    loadNotes();
  }, [loadNotes]); // Fixed: Include loadNotes in dependency array

  const handleCreateNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      toast.error('Please fill in both title and content');
      return;
    }

    setLoading(true);

    try {
      const response = await notesAPI.createNote(newNote);
      setNotes([response.note!, ...notes]);
      setNewNote({ title: '', content: '' });
      setShowNoteForm(false);
      toast.success('Note created successfully!');
    } catch (error) {
      const errorMessage = extractErrorMessage(error as ApiError);
      toast.error(errorMessage);
      console.error('Create Note Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    setLoading(true);
    try {
      await notesAPI.deleteNote(noteId);
      setNotes(notes.filter(note => note.id !== noteId));
      setExpandedNotes(prev => {
        const newSet = new Set(prev);
        newSet.delete(noteId);
        return newSet;
      });
      toast.success('Note deleted successfully!');
    } catch (error) {
      const errorMessage = extractErrorMessage(error as ApiError);
      toast.error(errorMessage);
      console.error('Delete Note Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleNoteExpansion = (noteId: string) => {
    setExpandedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(noteId)) {
        newSet.delete(noteId);
      } else {
        newSet.add(noteId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCancel = () => {
    setShowNoteForm(false);
    setNewNote({ title: '', content: '' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Dashboard icon and Sign Out */}
      <div className="bg-white px-4 py-6 lg:px-8 lg:py-8 flex justify-between items-center mb-8 lg:shadow-sm">
        <div className="flex items-center space-x-3 lg:space-x-4">
          <img 
            src={topImage} 
            alt="Logo" 
            className="w-8 h-8 lg:w-12 lg:h-12 object-contain"
          />
          <h1 className="text-xl lg:text-4xl font-semibold">Dashboard</h1>
        </div>
        <button
          onClick={onLogout}
          className="text-blue-500 hover:text-blue-600 underline text-sm lg:text-lg font-medium"
        >
          Sign Out
        </button>
      </div>

      {/* Main Content - Added bottom padding */}
      <div className="px-2 lg:px-8 pb-8">
        <div className="max-w-full mx-auto lg:max-w-4xl space-y-6">
          
          {/* Welcome Section - Increased height and font size */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 lg:p-8 shadow-md text-center min-h-[140px] lg:min-h-[180px] flex flex-col justify-center">
            <h2 className="text-xl lg:text-3xl font-bold text-black mb-2 lg:mb-4">
              Welcome, {user.name}!
            </h2>
            <div className="text-gray-600 text-sm lg:text-lg">
              <span className="font-medium">Email:</span> {user.email}
            </div>
          </div>

          {/* Create New Note Button */}
          <button
            onClick={() => setShowNoteForm(!showNoteForm)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg p-4 lg:p-6 shadow-md transition-colors flex items-center justify-center space-x-3 lg:text-xl lg:font-semibold"
          >
            <Plus size={20} className="lg:w-6 lg:h-6" />
            <span>Create New Note</span>
          </button>

          {/* Create Note Form */}
          {showNoteForm && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 lg:p-8 shadow-md">
              <h3 className="font-semibold mb-4 flex items-center space-x-2 text-lg lg:text-2xl lg:mb-6">
                <Edit3 size={20} className="lg:w-6 lg:h-6" />
                <span>Create New Note</span>
              </h3>
              <div className="space-y-4 lg:space-y-6">
                <input
                  type="text"
                  placeholder="Note Title"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none lg:p-4 lg:text-lg"
                />
                <textarea
                  placeholder="Write your note content here..."
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none lg:p-4 lg:text-lg lg:rows-6"
                />
                <div className="flex flex-col space-y-2 lg:flex-row lg:space-y-0 lg:space-x-4 lg:justify-center">
                  <button
                    onClick={handleCreateNote}
                    disabled={loading}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg py-2 px-6 transition-colors lg:py-3 lg:px-8 lg:text-lg lg:font-medium"
                  >
                    {loading ? 'Creating...' : 'Create Note'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-2 px-6 transition-colors lg:py-3 lg:px-8 lg:text-lg lg:font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notes Section */}
          <div>
            <h3 className="font-semibold mb-4 text-lg lg:text-2xl">Notes</h3>

            {notes.length === 0 ? (
              <div className="text-center bg-white border border-gray-200 rounded-lg p-12 shadow-sm">
                <Edit3 size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 mb-2 text-lg">No notes yet</p>
                <p className="text-gray-400">Create your first note to get started!</p>
              </div>
            ) : (
              <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
                {notes.map((note) => {
                  const isExpanded = expandedNotes.has(note.id);
                  
                  return (
                    <div 
                      key={note.id} 
                      className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden cursor-pointer lg:h-fit"
                      onClick={() => toggleNoteExpansion(note.id)}
                    >
                      {/* Note Header */}
                      <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors lg:p-6">
                        <h4 className="font-medium text-gray-800 flex-1 lg:text-lg lg:font-semibold break-words pr-2">
                          {note.title}
                        </h4>
                        <button
                          onClick={(e) => handleDeleteNote(note.id, e)}
                          className="text-gray-500 hover:text-red-500 transition-colors ml-2"
                          title="Delete note"
                        >
                          <Trash2 size={18} className="lg:w-5 lg:h-5" />
                        </button>
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="border-t border-gray-100 p-4 lg:p-6">
                          <p className="text-gray-600 mb-3 whitespace-pre-wrap lg:text-base lg:mb-4 lg:leading-relaxed break-words word-wrap">
                            {note.content}
                          </p>
                          <div className="text-gray-400 text-sm lg:text-sm">
                            Created: {formatDate(note.createdAt)}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
