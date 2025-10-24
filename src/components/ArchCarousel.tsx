import React, { useState, useEffect, useRef } from 'react';
// import { Users, Target, TrendingUp } from 'lucide-react';
// import RegistrationCard from './RegistrationCard';
import EventRegistrationCards from './EventCard';

const ArchCarousel: React.FC = () => {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [currentDragOffset, setCurrentDragOffset] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const lastDragTime = useRef(Date.now());
  const lastDragX = useRef(0);
const animationRef = useRef<number>(0);  
  // Team member images
  const teamMembers = [
    { id: 1, image: 'https://i.postimg.cc/JzmjVGpW/Whats-App-Image-2025-10-22-at-4-23-49-PM.jpg', name: 'Rev. Lady Adjoa Abrefi' },
    { id: 2, image: 'https://i.postimg.cc/Dy5w002S/Whats-App-Image-2025-10-22-at-4-23-49-PM-1.jpg', name: 'Dr. Jayne Banful' },
    { id: 3, image: 'https://i.postimg.cc/LsjdqQzk/Whats-App-Image-2025-10-22-at-4-23-49-PM-2.jpg', name: 'Sinéad Minkah' },
    { id: 4, image: 'https://i.postimg.cc/5NyZ52B8/Whats-App-Image-2025-10-22-at-4-23-50-PM.jpg', name: 'Sinéad Minkah' },
    { id: 5, image: 'https://i.postimg.cc/qR7LfzMG/Whats-App-Image-2025-10-22-at-4-31-03-PM.jpg', name: 'Dr. Jayne Banful' },
    { id: 6, image: 'https://i.postimg.cc/JzmjVGpW/Whats-App-Image-2025-10-22-at-4-23-49-PM.jpg', name: 'Rev. Lady Adjoa Abrefi' },
    { id: 7, image: 'https://i.postimg.cc/Dy5w002S/Whats-App-Image-2025-10-22-at-4-23-49-PM-1.jpg', name: 'Dr. Jayne Banful' },
    { id: 8, image: 'https://i.postimg.cc/LsjdqQzk/Whats-App-Image-2025-10-22-at-4-23-49-PM-2.jpg', name: 'Sinéad Minkah ' },
    { id: 9, image: 'https://i.postimg.cc/5NyZ52B8/Whats-App-Image-2025-10-22-at-4-23-50-PM.jpg', name: 'Sinéad Minkah' },
    { id: 10, image: 'https://i.postimg.cc/qR7LfzMG/Whats-App-Image-2025-10-22-at-4-31-03-PM.jpg', name: 'Dr. Jayne Banful' },
  ];

  // Create multiple copies for seamless infinite scroll
  const extendedMembers = [...teamMembers, ...teamMembers, ...teamMembers];
  const cardWidth = 160 + 24; // card width + gap
  const loopWidth = teamMembers.length * cardWidth;

  // Auto-scroll with momentum
  useEffect(() => {
    const animate = () => {
      if (!isDragging) {
        setOffset((prev) => {
          const newOffset = prev + velocity;
          // Seamless loop
          if (newOffset >= loopWidth) {
            return newOffset - loopWidth;
          }
          if (newOffset < 0) {
            return newOffset + loopWidth;
          }
          return newOffset;
        });
        
        // Gradually restore auto-scroll speed
        setVelocity((prev) => {
          const targetSpeed = 2;
          if (Math.abs(prev - targetSpeed) < 0.1) return targetSpeed;
          return prev + (targetSpeed - prev) * 0.05;
        });
      }
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isDragging, velocity, loopWidth]);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart(e.clientX);
    setCurrentDragOffset(0);
    lastDragTime.current = Date.now();
    lastDragX.current = e.clientX;
    document.body.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const now = Date.now();
    const timeDelta = now - lastDragTime.current;
    const currentDrag = e.clientX - dragStart;
    const dragDelta = e.clientX - lastDragX.current;
    
    setCurrentDragOffset(currentDrag);
    
    // Calculate velocity for momentum
    if (timeDelta > 0) {
      const calculatedVelocity = dragDelta / timeDelta * 16; // Normalize to ~60fps
      setVelocity(calculatedVelocity);
    }
    
    lastDragTime.current = now;
    lastDragX.current = e.clientX;
  };

  const handleMouseUp = () => {
    if (isDragging) {
      // Apply the drag offset to the actual offset
      setOffset(prev => {
        let newOffset = prev - currentDragOffset;
        // Keep within bounds
        while (newOffset >= loopWidth) newOffset -= loopWidth;
        while (newOffset < 0) newOffset += loopWidth;
        return newOffset;
      });
      setIsDragging(false);
      setCurrentDragOffset(0);
      document.body.style.cursor = '';
    }
  };

  const handleMouseLeave = () => {
    handleMouseUp();
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStart(e.touches[0].clientX);
    setCurrentDragOffset(0);
    lastDragTime.current = Date.now();
    lastDragX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const now = Date.now();
    const timeDelta = now - lastDragTime.current;
    const currentDrag = e.touches[0].clientX - dragStart;
    const dragDelta = e.touches[0].clientX - lastDragX.current;
    
    setCurrentDragOffset(currentDrag);
    
    if (timeDelta > 0) {
      const calculatedVelocity = dragDelta / timeDelta * 16;
      setVelocity(calculatedVelocity);
    }
    
    lastDragTime.current = now;
    lastDragX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (isDragging) {
      setOffset(prev => {
        let newOffset = prev - currentDragOffset;
        while (newOffset >= loopWidth) newOffset -= loopWidth;
        while (newOffset < 0) newOffset += loopWidth;
        return newOffset;
      });
      setIsDragging(false);
      setCurrentDragOffset(0);
    }
  };

  // Calculate height based on visual position on screen (arch curve effect)
  const getHeight = (index: number) => {
    const viewportCenter = window.innerWidth / 2;
    
    // Calculate card's current position on screen
    const currentOffset = offset - currentDragOffset;
    const cardPosition = (index * cardWidth) - currentOffset;
    const cardCenter = cardPosition + 80; // center of the card
    
    // Distance from viewport center
    const distanceFromCenter = Math.abs(cardCenter - viewportCenter);
    
    // Normalize distance (0 to 1)
    const normalizedDistance = Math.min(distanceFromCenter / (viewportCenter * 0.8), 1);
    
    // Calculate height: center cards are short (160px), edge cards are tall (280px)
    const minHeight = 160;
    const maxHeight = 280;
    const height = minHeight + (normalizedDistance * (maxHeight - minHeight));
    
    return Math.round(height);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent" />
        
        <div className="relative z-10 w-full px-0 pt-20 pb-32">
          {/* Header Text */}
          <div className="text-center">
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-10">
              Daughters Conference 2K25
              {/* <span className="block bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Registration
              </span> */}
            </h1>
          </div>

          {/* Draggable Arch Carousel */}
          <div 
            className="relative h-96 overflow-hidden select-none"
            style={{ 
              cursor: isDragging ? 'grabbing' : 'grab',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div 
              className="flex items-center gap-6"
              style={{ 
                transform: `translateX(-${offset - currentDragOffset}px)`,
                willChange: 'transform',
              }}
            >
              {extendedMembers.map((member, index) => {
                const height = getHeight(index);
                return (
                  <div
                    key={`${member.id}-${index}`}
                    className="flex-shrink-0 group"
                    style={{ 
                      width: '160px',
                      height: `${height}px`,
                      transition: 'height 0.3s ease-out',
                    }}
                  >
                    <div className="relative w-full h-full">
                      <div className="w-full h-full rounded-2xl overflow-hidden border-4 border-white/20 shadow-2xl transform transition-transform group-hover:scale-105">
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full object-cover"
                          draggable="false"
                        />
                      </div>
                      <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                          <p className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                            {member.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
          </div>
          <EventRegistrationCards/>

        </div>
        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20 -mb-48 -ml-48" />
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-pink-500 rounded-full blur-3xl opacity-20 -mr-48" />
      </div>
    </div>
  );
};

export default ArchCarousel;