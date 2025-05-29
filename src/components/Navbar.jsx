import React, { useEffect, useState } from 'react';
import { Search, Mic, Menu } from 'lucide-react';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/user/me', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });

        if (response.status === 401) {
          setUser(null);
          setIsLoading(false);
          return;
        }
        if (!response.ok) throw new Error('Auth check failed');

        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        console.error('Auth check failed:', err);
        setError('Authentication check failed');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Initialize Google Sign-In button
  useEffect(() => {
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleSignIn,
          context: 'signin',
          itp_support: true,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        const buttonContainer = document.getElementById('googleSignInBtn');
        if (buttonContainer) {
          buttonContainer.classList.remove('hidden');
          window.google.accounts.id.renderButton(buttonContainer, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
          });
        }
      } catch (err) {
        console.error('Google Sign-In initialization error:', err);
        setError('Failed to initialize Google Sign-In');
      }
    }
  }, []);

  // Handle Google login callback
  const handleGoogleSignIn = async (response) => {
    try {
      console.log('Google response:', response); // Debug log

      const res = await fetch('/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ 
          credential: response.credential 
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await res.json();
      setUser(data.user);
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    }
  };

  // Manually prompt Google sign-in
  const handleSignInClick = () => {
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt();
      } catch (err) {
        console.error('Error showing sign-in prompt:', err);
        setError('Failed to show sign-in prompt');
      }
    } else {
      setError('Google Sign-In not available');
    }
  };

  // Sign out user
  const handleSignOut = async () => {
    try {
      await fetch('/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
      if (window.google?.accounts?.id) {
        window.google.accounts.id.disableAutoSelect();
      }
      setError(null);
    } catch (err) {
      console.error('Sign out failed:', err);
      setError('Sign out failed');
    }
  };

  return (
    <div>
      <nav className="flex items-center justify-between px-4 py-2 bg-white mt-3 shadow-sm">
        <div className="flex items-center space-x-4">
          <Menu className="w-6 h-6 cursor-pointer" />
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Logo_2017.svg"
            alt="YouTube"
            className="h-6"
          />
        </div>

        <div className="flex items-center flex-1 mx-6 max-w-2xl">
          <div className="flex w-full border border-gray-300 rounded-l-full overflow-hidden">
            <input
              type="text"
              placeholder="Search"
              className="flex-grow px-4 py-1 outline-none"
            />
          </div>
          <button className="bg-gray-100 border border-l-0 border-gray-300 px-4 py-1 rounded-r-full hover:bg-gray-200">
            <Search className="w-6 h-6" />
          </button>
          <button className="ml-3 p-2 hover:bg-gray-100 rounded-full">
            <Mic className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        ) : user ? (
          <div className="flex items-center space-x-2">
            <img
              src={user.picture}
              alt={user.name}
              className="w-8 h-8 rounded-full cursor-pointer"
              onClick={handleSignOut}
              title={`Sign out ${user.name}`}
            />
          </div>
        ) : (
          <button
            onClick={handleSignInClick}
            className="text-black border border-gray-300 px-4 py-2 rounded-full hover:bg-gray-200 transition"
          >
            Sign in
          </button>
        )}
      </nav>

      {/* Error message */}
      {error && (
        <div className="mx-4 mt-2 p-2 bg-red-100 border border-red-300 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Google button container - optional if you want Google's official button */}
      <div id="googleSignInBtn" className="hidden"></div>
    </div>
  );
};

export default Navbar;
