import React, { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import Dashboard from './components/Dashboard';
import type { User } from './types';

// Import your images from assets
import hdLogo from './assets/images/top.svg';
import desktopSideImage from './assets/images/right-column.png';

type ViewType = 'signup' | 'signin' | 'dashboard';


const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? import.meta.env.VITE_API_URL : 'http://localhost:5000';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('signup');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authProcessing, setAuthProcessing] = useState(false);

  useEffect(() => {
    console.log('🔍 App useEffect - checking authentication...');
    console.log('Current URL:', window.location.href);
    console.log('Search params:', window.location.search);
    
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    console.log('Stored token exists:', !!storedToken);
    console.log('Stored user exists:', !!storedUser);
    
    const urlParams = new URLSearchParams(window.location.search);
    const authSuccess = urlParams.get('auth');
    const error = urlParams.get('error');
    
    console.log('Auth success param:', authSuccess);
    console.log('All URL params:', Array.from(urlParams.entries()));
    
    if (authSuccess === 'success') {
      console.log(' Google OAuth success detected, fetching user data...');
      setAuthProcessing(true);
      handleGoogleAuthSuccess();
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }
    
    if (storedToken && storedUser) {
      console.log(' Found stored auth, redirecting to dashboard');
      setUser(JSON.parse(storedUser));
      setCurrentView('dashboard');
      setIsLoading(false);
      return;
    }
    
    console.log('Error from URL:', error);
    
    if (error) {
      console.error(' OAuth error:', error);
      setAuthProcessing(false);
      setIsLoading(false);
      return;
    }
    
    console.log(' No auth detected, showing normal UI');
    setIsLoading(false);
  }, []);

  const handleGoogleAuthSuccess = async () => {
    try {
      console.log('🔍 Fetching user data from cookie-based auth...');
      
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API response status:', response.status);
      console.log('API response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const result = await response.json();
        console.log(' User data fetched:', result.user?.email);
        console.log('Full user data:', result);
        
        setUser(result.user);
        localStorage.setItem('user', JSON.stringify(result.user));
        console.log(' Authentication successful, setting dashboard view');
        setCurrentView('dashboard');
      } else {
        const errorText = await response.text();
        console.error(' Failed to fetch user data:', response.status, errorText);
      }
      
      setAuthProcessing(false);
      setIsLoading(false);
      
    } catch (error) {
      console.error(' Error handling Google auth success:', error);
      setAuthProcessing(false);
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = async (userData: User | null, authToken: string) => {
    try {
      console.log('🔍 handleAuthSuccess called with token (OTP auth)');
      setAuthProcessing(true);
      
      localStorage.setItem('token', authToken);
      
      if (!userData) {
        console.log('Fetching user data with token...');
        
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        console.log('API response status:', response.status);
        
        if (response.ok) {
          const result = await response.json();
          console.log('User data fetched:', result.user?.email);
          userData = result.user;
        } else {
          console.error('Failed to fetch user data:', response.status);
          setAuthProcessing(false);
          setIsLoading(false);
          return;
        }
      }
      
      if (userData) {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        console.log(' Authentication successful, setting dashboard view');
        setCurrentView('dashboard');
      }
      
      setAuthProcessing(false);
      setIsLoading(false);
      
    } catch (error) {
      console.error('Error handling auth success:', error);
      setAuthProcessing(false);
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    }).catch(console.error);
    
    setCurrentView('signin');
  };

  // Simple Loading Screen
  if (isLoading || authProcessing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (currentView === 'dashboard' && user) {
    return (
      <>
        <Dashboard user={user} onLogout={handleLogout} />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          className="!text-sm"
        />
      </>
    );
  }

  return (
    <>
      <div className="h-screen bg-white flex overflow-hidden">
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto">
          <div className="w-full max-w-md">
            <div className="flex items-center justify-center mb-8">
              <img 
                src={hdLogo} 
                alt="HD Logo" 
                className="h-12 object-contain"
              />
            </div>

            {currentView === 'signup' ? (
              <SignUp
                onSuccess={handleAuthSuccess}
                onSwitchToSignIn={() => setCurrentView('signin')}
              />
            ) : (
              <SignIn
                onSuccess={handleAuthSuccess}
                onSwitchToSignUp={() => setCurrentView('signup')}
              />
            )}
          </div>
        </div>

        <div className="hidden lg:block lg:w-1/2 relative p-0 m-0">
          <div 
            className="w-full h-full rounded-2xl overflow-hidden"
            style={{
              backgroundImage: `url(${desktopSideImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="!text-sm"
      />
    </>
  );
};

export default App;
