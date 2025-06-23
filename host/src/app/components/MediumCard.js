import Image from "next/image";
import { StarIcon } from "@heroicons/react/24/solid";

function MediumCard({ img, location, currency, price, rating }) {
  return (
    <div className="flex flex-col w-full space-y-2 cursor-pointer hover:scale-105 transition transform duration-200 ease-out">
      <div className="relative h-48 sm:h-52 md:h-60 w-full">
        <Image
          src={img}
          alt={location}
          fill
          className="rounded-xl"
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className="px-1">
        <h3 className="text-sm sm:text-base font-medium text-gray-900 truncate">{location}</h3>
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm sm:text-base font-semibold text-gray-900">
            {currency} {price} <span className="font-light text-gray-600">night</span>
          </p>
          <div className="flex items-center">
            <StarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
            <p className="ml-1 text-sm sm:text-base">{rating}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MediumCard; 