export interface User {
  id: string;
  name: string;
  email: string;
  dateOfBirth: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  user?: User;
  token?: string;
  notes?: Note[];
  note?: Note;
}

// Additional types for better API response handling
export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
  token: string;
}

export interface NotesResponse {
  success: boolean;
  message: string;
  notes: Note[];
}

export interface NoteResponse {
  success: boolean;
  message: string;
  note: Note;
}

export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
}
 export interface ApiError {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
    status?: number;
    statusText?: string;
  };
  message?: string;
  code?: string;
  name?: string;
}
