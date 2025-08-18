import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import Dashboard from './components/Dashboard';
import { authAPI } from './services/api';
import type { User } from './types';
import desktopSideImage from './assets/images/right-column.png';
import { extractErrorMessage } from './utils/errorHandler';
import type { ApiError } from './types';

const API_BASE_URL = import.meta.env.MODE === 'production' 
  ? import.meta.env.VITE_API_URL : 'http://localhost:5000/api';

type ViewType = 'signup' | 'signin' | 'dashboard';

// A component that displays a simple loading screen
const LoadingScreen = ({ message }: { message: string }) => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="text-center">
      {/* Simple spinner */}
      <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
      <p className="text-gray-700 text-sm font-medium">{message}</p>
    </div>
  </div>
);

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('signup');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if this is an OAuth redirect immediately
  const urlParams = new URLSearchParams(window.location.search);
  const authSuccess = urlParams.get('auth');

  const handleGoogleAuthSuccess = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      
      if (response.user) {
        setUser(response.user);
        setCurrentView('dashboard');
        toast.success(`Welcome back, ${response.user.name}!`);
      } else {
        throw new Error('User data not found in response');
      }
    } catch (error) {
      console.error('Error handling Google auth success:', error);
      const errorMessage = extractErrorMessage(error as ApiError);
      toast.error(errorMessage);
      authAPI.clearAuthData();
      setCurrentView('signin');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = (userData: User) => {
    setUser(userData);
    setCurrentView('dashboard');
    toast.success(`Welcome, ${userData.name}!`);
  };

  useEffect(() => {
    const handleInitialAuthCheck = async () => {
      try {
        if (authSuccess === 'success') {
          // Clear URL immediately to prevent loops
          window.history.replaceState({}, document.title, window.location.pathname);
          await handleGoogleAuthSuccess();
          return;
        }

        // Check stored authentication
        const storedUser = authAPI.getStoredUser();
        if (storedUser) {
          setUser(storedUser);
          setCurrentView('dashboard');
        } else {
          setCurrentView('signin');
        }
      } catch (error) {
        console.error("Initial auth check failed:", error);
        authAPI.clearAuthData();
        setCurrentView('signin');
      } finally {
        setIsLoading(false);
      }
    };
    
    handleInitialAuthCheck();
  }, [authSuccess]);

  const handleLogout = () => {
    authAPI.logout();
    setUser(null);
    setCurrentView('signin');
    toast.success('Signed out successfully');
  };

  // Show loading immediately for OAuth redirects or initial loading
  if (isLoading || authSuccess === 'success') {
    const message = authSuccess === 'success' ? 'Completing sign in...' : 'Loading...';
    return <LoadingScreen message={message} />;
  }

  if (currentView === 'dashboard' && user) {
    return (
      <>
        <Dashboard user={user} onLogout={handleLogout} />
        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          className="!text-sm"
          toastClassName="font-medium"
        />
      </>
    );
  }

  return (
    <>
      <div className="h-screen bg-white flex">
        {/* Left Side - Auth Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-8">
          <div className="w-full max-w-md">
            {currentView === 'signup' ? (
              <SignUp
                onSuccess={(user) => handleAuthSuccess(user)}
                onSwitchToSignIn={() => setCurrentView('signin')}
              />
            ) : (
              <SignIn
                onSuccess={(user) => handleAuthSuccess(user)}
                onSwitchToSignUp={() => setCurrentView('signup')}
              />
            )}
          </div>
        </div>

          <div className="hidden lg:block lg:w-1/2 relative p-1">
          <div 
            className="w-full h-full rounded-xl bg-center"
            style={{
              backgroundImage: `url(${desktopSideImage})`,
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
        toastClassName="font-medium"
      />
    </>
  );
}

export default App;