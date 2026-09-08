import React, { useState, useEffect } from 'react';

export default function Promote() {
  const images = [
    "/assets/Banner.png", // Correct path
    "/assets/banner4.png", // Correct path
    "/assets/Banner5.png"  // Correct path
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval); // Clear the interval on component unmount
  }, [images.length]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-black/[0.06] shadow-[0_10px_35px_rgba(0,0,0,0.05)] bg-black/5 group">
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <div key={index} className="min-w-full relative">
            <img
              src={image}
              alt={`Promotional Banner ${index + 1}`}
              className="w-full h-[180px] sm:h-[260px] md:h-[340px] lg:h-[400px] object-cover"
            />
          </div>
        ))}
      </div>

      {/* Apple-style Slider Dots */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-2 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`transition-all duration-300 rounded-full ${
              currentImageIndex === index
                ? 'w-6 h-2 bg-white shadow'
                : 'w-2 h-2 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
