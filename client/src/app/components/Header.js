'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FaBars, FaTimes, FaUserCircle } from 'react-icons/fa';

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
            className="flex items-center cursor-pointer gap-2"
          >
            <span className='text-2xl font-extrabold text-indigo-700 tracking-tight'>
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">StayFinder</span>
            </span>
          </div>

          {/* User/Account Section */}
          <div className="flex items-center space-x-2">
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <FaUserCircle className="text-2xl text-indigo-600" />
                  <span className="text-sm font-semibold text-gray-800">{user.name.split(" ")[0]}</span>
                </button>
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto transition-all duration-200 z-50">
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className={`block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-b-lg transition-colors ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="hidden lg:flex items-center space-x-2">
                <Link href="/login">
                  <span className="px-4 py-2 rounded-lg border border-indigo-600 text-indigo-600 font-semibold hover:bg-indigo-50 transition-colors cursor-pointer">Login</span>
                </Link>
                <Link href="/register">
                  <span className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors cursor-pointer">Register</span>
                </Link>
              </div>
            )}

          </div>
        </div>

      </div>
    </header>
  );
};

export default Header; 