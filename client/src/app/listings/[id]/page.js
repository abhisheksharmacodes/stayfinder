'use client';

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import DatePicker from '../../components/DatePicker';
import Snackbar from '../../components/Snackbar';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

function ListingDetail() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [listingData, setListingData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [guests, setGuests] = useState(1);
  const [bookedRanges, setBookedRanges] = useState([]);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    isVisible: false,
    message: '',
    type: 'success'
  });

  const showSnackbar = (message, type = 'success') => {
    setSnackbar({
      isVisible: true,
      message,
      type
    });
  };

  const hideSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      isVisible: false
    }));
  };

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await fetch(`https://glen-21u1.vercel.app/api/listings/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch listing details');
        }
        const data = await response.json();
        setListingData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    const fetchBookings = async () => {
      try {
        const res = await fetch(`https://glen-21u1.vercel.app/api/bookings?listingId=${id}`);
        if (res.ok) {
          const bookings = await res.json();
          setBookedRanges(bookings.map(b => ({ start: new Date(b.startDate), end: new Date(b.endDate) })));
        }
      } catch {}
    };
    fetchListing();
    fetchBookings();
  }, [id]);

  const handleDateChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleGuestChange = (e) => {
    setGuests(Number(e.target.value));
  };

  const handleReserve = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      showSnackbar('Please log in to reserve.', 'error');
      return;
    }
    try {
      const res = await fetch('https://glen-21u1.vercel.app/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          listingId: id,
          startDate,
          endDate,
          guests
        })
      });
      if (res.status === 409) {
        const data = await res.json();
        showSnackbar(data.message || 'Already booked, kindly select different date(s)', 'error');
      } else if (!res.ok) {
        const data = await res.json();
        showSnackbar(data.message || 'Booking failed', 'error');
      } else {
        showSnackbar('Booking successful!', 'success');
        
        // Update booked ranges in real-time
        const newBooking = { start: new Date(startDate), end: new Date(endDate) };
        setBookedRanges(prevRanges => [...prevRanges, newBooking]);
        
        // Reset date selection
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        setStartDate(today);
        setEndDate(today);
      }
    } catch (err) {
      showSnackbar('Booking failed', 'error');
    }
  };

  if (isLoading) {
    return (
      <div>
        <Header />
        <main className="max-w-7xl mx-auto px-8 sm:px-16 pt-6">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !listingData) {
    return (
      <div>
        <Header />
        <main className="max-w-7xl mx-auto px-8 sm:px-16 pt-6">
          <h1 className="text-2xl font-semibold pb-5">Listing Not Found</h1>
          <p>The property you are looking for does not exist.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="pt-4 sm:pt-6">
          <h1 className="text-2xl sm:text-3xl font-semibold pb-3 sm:pb-5 px-4 sm:px-0">{listingData.title} in {listingData.city}</h1>

          {/* Responsive Image Gallery */}
          <div className="grid grid-cols-2 grid-rows-2 gap-2 rounded-xl overflow-hidden mb-4 sm:mb-6">
            <div className="relative col-span-2 row-span-2 h-48 sm:h-64 md:h-80 lg:h-96">
              <Image 
                src={listingData.images[0]} 
                fill
                style={{ objectFit: "cover" }}
                alt="Main Listing Image" 
              />
            </div>
            {listingData.images.slice(1, 5).map((image, index) => (
              <div key={index} className="relative h-24 sm:h-32 md:h-40 lg:h-48">
                <Image 
                  src={image} 
                  fill
                  style={{ objectFit: "cover" }}
                  alt={`Listing Image ${index + 1}`} 
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row lg:space-x-8">
            {/* Left Column - Property Details */}
            <div className="flex-grow px-4 sm:px-0">
              <h2 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3">{listingData.location}</h2>
              <p className="text-gray-600 text-sm mb-3 sm:mb-4">
                {listingData.guests} guests · {listingData.bedrooms} bedroom · {listingData.beds} bed · {listingData.bathrooms} bathrooms
              </p>

              {/* Google Maps Embed */}
              <div className="mb-4 sm:mb-6">
                <h3 className="text-lg font-semibold mb-2">Location on Map</h3>
                <div className="relative w-full h-48 sm:h-64 md:h-80">
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0, borderRadius: '12px' }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${listingData.coordinates.lat},${listingData.coordinates.long}&z=14&output=embed`}
                  ></iframe>
                </div>
              </div>

              {/* Guest Favourite / Rating / Reviews */}
              <div className="flex flex-wrap items-center space-x-2 sm:space-x-4 mb-4 sm:mb-6">
                <span className="flex items-center text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.071 3.292a1 1 0 00.95.691h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.031a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.683-1.539 1.118l-2.8-2.031a1 1 0 00-1.176 0l-2.8 2.031c-.784.565-1.839-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.05 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.691l1.07-3.292z" />
                  </svg>
                  <span className="ml-1 text-sm sm:text-base font-semibold">Guest favourite</span>
                </span>
                <span className="font-bold text-sm sm:text-base">{listingData.rating}</span>
                <span className="text-gray-600 text-sm sm:text-base">({listingData.reviews} reviews)</span>
              </div>

              {/* Host Info */}
              <div className="flex items-center space-x-3 sm:space-x-4 border-t border-b py-4 sm:py-6 mb-4 sm:mb-6">
                <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-full overflow-hidden flex-shrink-0">
                  <Image 
                    src={listingData.host.avatar || "https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-photo-183042379.jpg"} 
                    fill
                    style={{ objectFit: "cover" }}
                    alt="Host Avatar" 
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-sm sm:text-base">Hosted by {listingData.host.name}</h4>
                  <p className="text-xs sm:text-sm text-gray-600">{listingData.host.yearsHosting} year hosting</p>
                </div>
              </div>

              {/* Description */}
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">About this space</h2>
              <p className="text-gray-700 text-sm sm:text-base mb-4 sm:mb-6">{listingData.description.main}</p>

              {/* Features/Amenities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                {listingData.description.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <i className={`${feature.icon} text-gray-600`}></i>
                    <p className="text-sm sm:text-base">{feature.text}</p>
                  </div>
                ))}
              </div>

            </div>

            {/* Right Column - Booking Box */}
            <div className="w-full lg:w-96 xl:w-122 h-auto self-start p-4 sm:p-6 border rounded-xl shadow-lg mt-6 lg:mt-0">
              <div className="flex justify-between items-center mb-4">
                <p className="text-xl sm:text-2xl font-bold">{listingData.currency}{listingData.price} <span className="font-normal text-sm sm:text-base text-gray-600">/ night</span></p>
                <p className="text-xs sm:text-sm text-gray-600">Prices include all fees</p>
              </div>
              <DatePicker startDate={startDate} endDate={endDate} onChange={handleDateChange} disabledRanges={bookedRanges} />
              <div className="mt-4">
                <label htmlFor="guests" className="block text-sm font-medium text-gray-700">Guests</label>
                <select
                  id="guests"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-sm sm:text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                  value={guests}
                  onChange={handleGuestChange}
                >
                  {[...Array(listingData.guests)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} {i === 0 ? 'guest' : 'guests'}
                    </option>
                  ))}
                </select>
              </div>
              <button className="w-full px-4 sm:px-6 py-3 mt-4 sm:mt-6 text-white bg-red-400 rounded-lg hover:bg-red-500 transition duration-150 cursor-pointer text-sm sm:text-base" onClick={handleReserve}>
                Reserve
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <Snackbar
        isVisible={snackbar.isVisible}
        message={snackbar.message}
        type={snackbar.type}
        onClose={hideSnackbar}
      />
    </div>
  );
}

export default ListingDetail; 