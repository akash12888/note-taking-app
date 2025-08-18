import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit3, Search, Eye, EyeOff, Calendar, Grid3X3, List } from 'lucide-react';
import { toast } from 'react-toastify';
import { notesAPI } from '../services/api';
import { extractErrorMessage } from '../utils/errorHandler';
import type { User as UserType, Note, ApiError } from '../types';

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

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
  }, [loadNotes]);

  const handleCreateNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      toast.error('Please fill in both title and content');
      return;
    }

    setLoading(true);

    try {
      const response = await notesAPI.createNote(newNote);
      if (response.note) {
        setNotes([response.note, ...notes]);
        setNewNote({ title: '', content: '' });
        setShowNoteForm(false);
        toast.success('Note created successfully!');
      } else {
        throw new Error('Note creation failed: Invalid response from server.');
      }
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

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 lg:px-10 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 48 48" fill="none" className="w-5 h-5">
                <path d="M44 11.2727C44 14.0109 39.8386 16.3957 33.69 17.6364C39.8386 18.877 44 21.2618 44 24C44 26.7382 39.8386 29.123 33.69 30.3636C39.8386 31.6043 44 33.9891 44 36.7273C44 40.7439 35.0457 44 24 44C12.9543 44 4 40.7439 4 36.7273C4 33.9891 8.16144 31.6043 14.31 30.3636C8.16144 29.123 4 26.7382 4 24C4 21.2618 8.16144 18.877 14.31 17.6364C8.16144 16.3957 4 14.0109 4 11.2727Z" fill="white"/>
              </svg>
            </div>
            <h2 className="text-gray-900 text-xl font-bold tracking-tight">NoteSphere</h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center bg-gray-100 rounded-xl overflow-hidden min-w-[320px]">
              <Search className="w-5 h-5 text-gray-500 ml-4" />
              <input
                type="text"
                placeholder="Search your notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-gray-900 placeholder-gray-500 px-4 py-3 flex-1 outline-none font-medium"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">{user.name.charAt(0)}</span>
              </div>
              
              <button
                onClick={onLogout}
                className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
            Welcome back, {user.name.split(' ')[0]} 
          </h1>
          <p className="text-gray-600 text-lg">Here are all your notes in one place</p>
        </div>

        <div className="mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Notes</h3>
            <p className="text-3xl font-bold text-gray-900">{notes.length}</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 tracking-tight">Quick Actions</h2>
          <button
            onClick={() => setShowNoteForm(!showNoteForm)}
            className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            New Note
          </button>
        </div>

        <div className="lg:hidden mb-6">
          <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden">
            <Search className="w-5 h-5 text-gray-500 ml-4" />
            <input
              type="text"
              placeholder="Search your notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-gray-900 placeholder-gray-500 px-4 py-3 flex-1 outline-none font-medium"
            />
          </div>
        </div>

        {showNoteForm && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3 tracking-tight">
              <Edit3 className="w-5 h-5" />
              Create New Note
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Give your note a title..."
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 px-4 py-3 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors font-medium"
              />
              <textarea
                placeholder="Start writing your thoughts..."
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                rows={6}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 px-4 py-3 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none transition-colors font-medium"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleCreateNote}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm"
                >
                  {loading ? 'Creating...' : 'Save Note'}
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Your Notes</h2>
            
            <div className="hidden lg:flex items-center bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {filteredNotes.length === 0 ? (
            <div className="text-center bg-white rounded-2xl border border-gray-200 p-12 shadow-sm">
              <Edit3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2 text-lg font-medium">No notes found</p>
              <p className="text-gray-500">
                {searchQuery ? 'Try a different search term' : 'Create your first note to get started!'}
              </p>
            </div>
          ) : (
            <div className={
              typeof window !== 'undefined' && window.innerWidth >= 1024 && viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'space-y-3'
            }>
              {filteredNotes.map((note) => {
                const isExpanded = expandedNotes.has(note.id);
                
                return (
                  <div
                    key={note.id}
                    className="bg-white border border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer overflow-hidden"
                    onClick={() => toggleNoteExpansion(note.id)}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3 gap-3">
                        <h4 className="text-gray-900 font-semibold text-lg flex-1 break-words overflow-hidden tracking-tight min-w-0">
                          {note.title}
                        </h4>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {isExpanded ? (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-400" />
                          )}
                          <button
                            onClick={(e) => handleDeleteNote(note.id, e)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-gray-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="border-t border-gray-100 pt-4 mt-4 mb-4">
                          <div className="max-h-96 overflow-y-auto">
                            <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap font-medium break-words">
                              {note.content}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs font-medium">
                          {formatDate(note.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
