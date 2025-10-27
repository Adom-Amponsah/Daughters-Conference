import React from 'react';

import ArchCarousel from '../components/ArchCarousel';


// Large Polaroid photos for background - screen filling size
const polaroidPhotos = [
  {
    id: 1,
    image: "https://i.postimg.cc/ZKgQ3kHj/Whats-App-Image-2025-10-23-at-2-09-00-PM-1.jpg",
    rotation: "-8deg",
    position: { top: "-10%", left: "-15%" }
  },
  {
    id: 2,
    image: "https://i.postimg.cc/J7YYVwfK/Whats-App-Image-2025-10-23-at-2-09-00-PM.jpg",
    rotation: "12deg",
    position: { top: "-20%", right: "-20%" }
  },
  {
    id: 3,
    image: "https://i.postimg.cc/LsjdqQzk/Whats-App-Image-2025-10-22-at-4-23-49-PM-2.jpg",
    rotation: "-15deg",
    position: { bottom: "-25%", left: "-10%" }
  },
  {
    id: 4,
    image: "https://i.postimg.cc/R00GbXgW/Whats-App-Image-2025-10-23-at-2-09-01-PM.jpg",
    rotation: "18deg",
    position: { bottom: "-30%", right: "-25%" }
  },
  {
    id: 5,
    image: "https://i.postimg.cc/R00GbXgW/Whats-App-Image-2025-10-23-at-2-09-01-PM.jpg",
    rotation: "-10deg",
    position: { top: "20%", left: "-30%" }
  },
  {
    id: 6,
    image: "https://i.postimg.cc/J7YYVwfK/Whats-App-Image-2025-10-23-at-2-09-00-PM.jpg",
    rotation: "6deg",
    position: { top: "10%", right: "-35%" }
  }
];
const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen relative overflow-hidden p-0 m-0">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
        {/* Subtle overlay */}
        <div className="absolute inset-0 bg-white/20" />
      </div>

      {/* Polaroid Photos Container with Dark Overlay */}
      <div className="absolute inset-0 z-10">
        {/* Large Polaroid Photos Background */}
        {polaroidPhotos.map((photo) => (
          <div
            key={photo.id}
            className="absolute 
              w-[95vw] h-[70vh] md:w-[85vw] md:h-[80vh] lg:w-[80vw] lg:h-[90vh] 
              bg-white 
              p-3 md:p-6 lg:p-8 
              shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]"
            style={{
              ...photo.position,
              transform: `rotate(${photo.rotation})`,
            }}
          >
            {/* Photo */}
            <div 
              className="w-full 
                h-[55vh] md:h-[65vh] lg:h-[75vh] 
                bg-cover bg-center rounded-lg"
              style={{
                backgroundImage: `url(${photo.image})`,
              }}
            />
            {/* White bottom space like real polaroid */}
            <div className="h-[10vh] md:h-[10vh] lg:h-[10vh] bg-white flex items-center justify-center">
              <div className="w-16 md:w-24 lg:w-32 h-1 md:h-1.5 lg:h-2 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
        
        {/* Dark overlay ONLY over polaroid photos */}
        <div className="absolute inset-0 bg-black/65 pointer-events-none"></div>
      </div>
      
      {/* Header */}
      {/* <Header /> */}
      
      {/* Main Content - Full Width */}
      <div className="w-full p-0 m-0">
        <ArchCarousel />
      </div>
                      {/* <EventRegistrationCards /> */}

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20 -mb-48 -ml-48" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-pink-500 rounded-full blur-3xl opacity-20 -mr-48" />
      
      {/* Secret Admin Button */}
      <button
        onClick={() => window.location.href = '/admin'}
        className="fixed bottom-4 right-4 w-12 h-12 bg-gray-800 hover:bg-gray-700 text-white rounded-full flex items-center justify-center opacity-30 hover:opacity-100 transition-all duration-300 z-50"
        title="Admin Panel"
      >
        <span className="text-xs font-bold">A</span>
      </button>
    </div>
  );
};

export default LandingPage;