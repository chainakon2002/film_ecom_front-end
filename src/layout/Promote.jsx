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
    <div className="flex overflow-hidden relative w-full h-auto">

      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <div key={index} className="min-w-full">
            <img
              src={image}
              alt={`Promotional Banner ${index + 1}`}
              className="rounded-3xl w-full h-auto"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
