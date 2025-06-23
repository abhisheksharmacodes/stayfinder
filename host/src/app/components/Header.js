'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';

const Header = ({ searchInput, setSearchInput }) => {
  const router = useRouter();
  const pathname = usePathname();
  const isListingPage = pathname.startsWith('/listings/');
  const [user, setUser] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      // Clear user data from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);

      // Redirect to login page
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, we still want to clear local data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left - Logo */}
          <div 
            onClick={() => router.push('/')} 
            className="flex items-center cursor-pointer"
          >
            <span className='text-xl sm:text-2xl font-bold text-gray-900'>StayFinder</span>
          </div>

          {/* Desktop Menu */}
          <div className="flex items-center space-x-4 text-gray-500">
            {user ? (
              <>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Welcome, {user.name.split(" ")[0]}</span>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className={`px-3 py-2 text-sm rounded-lg hover:text-red-600 cursor-pointer transition-colors ${
                      isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <p className="cursor-pointer hover:text-gray-700 transition-colors">Login</p>
                </Link>
                <Link href="/register">
                  <p className="cursor-pointer hover:text-gray-700 transition-colors">Register</p>
                </Link>
              </>
            )}
          </div>

          
        </div>

        
      </div>
    </header>
  );
};

export default Header; 