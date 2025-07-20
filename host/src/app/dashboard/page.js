"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MediumCard from '../components/MediumCard';

export default function DashboardPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchListings() {
      try {
        const res = await fetch("https://glen-21u1.vercel.app/api/listings");
        if (!res.ok) throw new Error("Failed to fetch listings");
        const data = await res.json();
        setListings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchListings();
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Host Dashboard</h1>
          <button
            className="inline-flex cursor-pointer items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold px-6 py-3 rounded-lg shadow hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
            onClick={() => router.push("/dashboard/add-listing")}
          >
            <span className="text-lg font-bold">+ Add Listing</span>
          </button>
        </div>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mb-4"></div>
            <span className="text-gray-500 text-lg">Loading listings...</span>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-center font-medium">
            {error}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center text-gray-500 py-12 text-lg">No listings found. Click <span className='font-semibold text-indigo-600'>Add Listing</span> to get started!</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {listings.map(listing => (
              <div
                key={listing._id}
                onClick={() => router.push(`/dashboard/edit-listing/${listing._id}`)}
                className="cursor-pointer group hover:scale-[1.01] active:scale-95 transition-transform duration-200"
              >
                <MediumCard
                  currency={listing.currency}
                  img={listing.images && listing.images[0]}
                  location={listing.title+" in "+listing.city}
                  price={listing.price}
                  rating={listing.rating}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 