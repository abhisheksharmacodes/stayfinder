'use client';

import Image from "next/image";
import Header from './components/Header';
import MediumCard from './components/MediumCard';
import Footer from './components/Footer';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

export default function Home() {
  const [searchInput, setSearchInput] = useState('');
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [availabilityDate, setAvailabilityDate] = useState('');
  const [bookingsMap, setBookingsMap] = useState({});
  const [selectedCity, setSelectedCity] = useState('');
  const [guestsFilter, setGuestsFilter] = useState('');

  // Extract unique city names from listings
  const cityOptions = Array.from(new Set(listings.map(l => l.city).filter(Boolean))).sort((a, b) => a.localeCompare(b));

  // Get today's date in yyyy-mm-dd format
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch('https://glen-three.vercel.app/api/listings');
        if (!response.ok) {
          throw new Error('Failed to fetch listings');
        }
        const data = await response.json();
        setListings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, []);

  // Fetch bookings for all listings when listings are loaded
  useEffect(() => {
    if (listings.length === 0) return;
    const fetchAllBookings = async () => {
      const map = {};
      await Promise.all(listings.map(async (listing) => {
        try {
          const res = await fetch(`https://glen-three.vercel.app/api/bookings?listingId=${listing._id}`);
          if (res.ok) {
            const bookings = await res.json();
            map[listing._id] = bookings.map(b => ({ start: new Date(b.startDate), end: new Date(b.endDate) }));
          }
        } catch { }
      }));
      setBookingsMap(map);
    };
    fetchAllBookings();
  }, [listings]);

  // Helper to normalize date to midnight
  function normalizeToMidnight(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }

  // Helper to check if a property is available on a given date
  function isAvailableOnDate(listingId, dateStr) {
    if (!dateStr || !bookingsMap[listingId]) return true;
    const date = normalizeToMidnight(dateStr);
    return !bookingsMap[listingId].some(({ start, end }) => {
      const startNorm = normalizeToMidnight(start);
      const endNorm = normalizeToMidnight(end);
      return date >= startNorm && date <= endNorm;
    });
  }

  // Helper to check if any filter is applied
  const isAnyFilterApplied = () => {
    return (
      searchInput ||
      selectedCity ||
      minPrice ||
      maxPrice ||
      availabilityDate ||
      guestsFilter
    );
  };

  const filteredProperties = listings.filter(property => {
    // City filter
    if (selectedCity && property.city !== selectedCity) return false;
    // Where filter (search input) - match city key
    if (searchInput && !property.city?.toLowerCase().includes(searchInput.toLowerCase())) return false;
    // Price filter
    if (minPrice && property.price < parseInt(minPrice)) return false;
    if (maxPrice && property.price > parseInt(maxPrice)) return false;
    // Availability date filter
    if (availabilityDate && !isAvailableOnDate(property._id, availabilityDate)) return false;
    // Guests filter
    if (guestsFilter && property.guests < parseInt(guestsFilter)) return false;
    return true;
  });

  const clearFilters = () => {
    setSearchInput('');
    setSelectedCity('');
    setMinPrice('');
    setMaxPrice('');
    setAvailabilityDate('');
    setGuestsFilter('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div>
      <Header searchInput={searchInput} setSearchInput={setSearchInput} />
      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Responsive filter bar */}
          <div className="flex justify-center mt-2 sm:mt-14 mb-4">
            <div className="w-full lg:w-auto">
              {/* Desktop filter bar */}
              <div className="hidden lg:flex items-center bg-white rounded-full shadow-md px-3 py-1 border border-gray-200">
                {/* Where */}
                <div className="flex flex-col px-4 py-2">
                  <span className="text-xs font-semibold text-gray-700">Where</span>
                  <input
                    type="text"
                    placeholder="Search destinations"
                    className="outline-none bg-transparent text-sm w-26"
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    style={{ minWidth: 120 }}
                  />
                </div>
                <div className="h-8 border-l mx-2" />
                {/* Available on */}
                <div className="flex flex-col px-4 py-2">
                  <span className="text-xs font-semibold text-gray-700">Available on</span>
                  <input
                    type="date"
                    className="outline-none bg-transparent text-sm w-26"
                    value={availabilityDate}
                    onChange={e => setAvailabilityDate(e.target.value)}
                    min={todayStr}
                    style={{ minWidth: 100 }}
                  />
                </div>
                <div className="h-8 border-l mx-2" />
                {/* Min price */}
                <div className="flex flex-col px-4 py-2">
                  <span className="text-xs font-semibold text-gray-700">Min price</span>
                  <input
                    type="number"
                    min="0"
                    step={100}
                    placeholder="Min price"
                    className="outline-none bg-transparent text-sm w-10"
                    value={minPrice}
                    onChange={e => setMinPrice(e.target.value)}
                    style={{ minWidth: 80 }}
                  />
                </div>
                <div className="h-8 border-l mx-2" />
                {/* Max price */}
                <div className="flex flex-col px-4 py-2">
                  <span className="text-xs font-semibold text-gray-700">Max price</span>
                  <input
                    type="number"
                    min="0"
                    step={100}
                    placeholder="Max price"
                    className="outline-none bg-transparent text-sm w-16"
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                    style={{ minWidth: 80 }}
                  />
                </div>
                {/* Icon at the end */}
                <div className="ml-4 flex items-center justify-center">
                  {isAnyFilterApplied() ? (
                    <button
                      onClick={clearFilters}
                      className="bg-gray-200 hover:bg-gray-300 rounded-full p-2 text-gray-600"
                      title="Clear filters"
                    >
                      <FaTimes size={18} className="m-[2px]" />
                    </button>
                  ) : (
                    <button
                      className="bg-rose-500 hover:bg-rose-600 rounded-full p-2 text-white"
                      title="Search"
                    >
                      <FaSearch size={18} className="m-[3px]" />
                    </button>
                  )}
                </div>
              </div>

              {/* Mobile/Tablet filter bar */}
              <div className="lg:hidden w-full bg-white rounded-lg shadow-md p-4 border border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Where */}
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-700 mb-1">Where</span>
                    <input
                      type="text"
                      placeholder="Search destinations"
                      className="outline-none bg-gray-50 rounded-md px-3 py-2 text-sm"
                      value={searchInput}
                      onChange={e => setSearchInput(e.target.value)}
                    />
                  </div>
                  {/* Available on */}
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-700 mb-1">Available on</span>
                    <input
                      type="date"
                      className="outline-none w-full bg-gray-50 rounded-md px-3 py-2 text-sm"
                      value={availabilityDate}
                      onChange={e => setAvailabilityDate(e.target.value)}
                      min={todayStr}
                    />
                  </div>
                  {/* Min price */}
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-700 mb-1">Min price</span>
                    <input
                      type="number"
                      min="0"
                      step={100}
                      placeholder="Min price"
                      className="outline-none bg-gray-50 rounded-md px-3 py-2 text-sm"
                      value={minPrice}
                      onChange={e => setMinPrice(e.target.value)}
                    />
                  </div>
                  {/* Max price */}
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-700 mb-1">Max price</span>
                    <input
                      type="number"
                      min="0"
                      step={100}
                      placeholder="Max price"
                      className="outline-none bg-gray-50 rounded-md px-3 py-2 text-sm"
                      value={maxPrice}
                      onChange={e => setMaxPrice(e.target.value)}
                    />
                  </div>
                </div>
                {/* Mobile filter actions */}
                {isAnyFilterApplied() ? (
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={clearFilters}
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                    >
                      <FaTimes size={16} />
                      <span className="text-sm">Clear filters</span>
                    </button>

                  </div>) : null}
              </div>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-semibold py-4 sm:py-6 px-4 sm:px-0">Popular properties</h2>
          {filteredProperties.length ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 p-4 sm:p-0">
            {filteredProperties?.map(({ _id, images, city, title, currency, price, rating }) => (
              <Link key={_id} href={`/listings/${_id}`}>
                <MediumCard
                  img={images[0]}
                  currency={currency}
                  location={title + ' in ' + city}
                  price={price}
                  nights={2}
                  rating={rating}
                />
              </Link>
            ))}
          </div> : <span className="w-full">No properties match your current filters.</span>}
        </section>
      </main>

      <Footer />
    </div>
  );
}
