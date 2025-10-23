import React from 'react';
import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';
import { RegistrationStepper } from "./RegistrationStepper";
import type { StepperMode } from "@/components/RegistrationStepper";

interface EventCardProps {
  title: string;
  subtitle?: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  imageUrl: string;
  gradientFrom: string;
  gradientTo: string;
  onClick: () => void;
}

const EventCard: React.FC<EventCardProps> = ({
  title,
  subtitle,
  date,
  time,
  venue,
  address,
  imageUrl,
  gradientFrom,
  gradientTo,
  onClick
}) => {
  return (
    <div 
      onClick={onClick}
      className="relative w-110 h-96 rounded-3xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      
      {/* Gradient Overlay */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientTo} opacity-85 group-hover:opacity-90 transition-opacity duration-300`}
      />
      
      {/* Content */}
      <div className="relative h-full flex flex-col justify-between p-6 text-white">
        {/* Title Section */}
        <div>
          <h2 className="text-4xl font-bold leading-tight mb-1">
            {title}
          </h2>
          {subtitle && (
            <h3 className="text-3xl font-semibold opacity-95">
              {subtitle}
            </h3>
          )}
        </div>
        
        {/* Info Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 text-gray-800 shadow-lg">
          <div className="flex items-start gap-3 mb-3">
            <div className="bg-white rounded-lg p-2 shadow-md flex-shrink-0">
              <Calendar className="w-5 h-5 text-rose-500" />
              <div className="text-center mt-1">
                <div className="text-xl font-bold leading-none">{date.split(' ')[0]}</div>
                <div className="text-xs uppercase">{date.split(' ')[1]}</div>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm mb-1">{venue}</h4>
              <p className="text-xs text-gray-600 leading-tight mb-2">{address}</p>
              
              <div className="flex items-center gap-1 text-xs">
                <Clock className="w-3 h-3" />
                <span className="font-medium">{time}</span>
              </div>
            </div>
          </div>
          
          {/* Hover Arrow */}
          <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <ArrowRight className="w-5 h-5 text-rose-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component with both cards
const EventRegistrationCards: React.FC = () => {
  const [showStepper, setShowStepper] = React.useState<false | StepperMode>(false);

  const handleNewRegistration = () => {
    setShowStepper("register");
  };
  
  const handleExistingUser = () => {
    setShowStepper("login");
  };

  return (
    <>
      <div className="w-full py-4 px-2">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-4">
          <EventCard
            title="Register"
            subtitle="Now"
            date="15 Dec"
            time="2:00 PM GMT"
            venue="Innovation Hub"
            address="40 Classical Rd, London NW1 8LS, United Kingdom"
            imageUrl="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800"
            gradientFrom="from-blue-500/80"
            gradientTo="to-cyan-400/80"
            onClick={handleNewRegistration}
          />
          <EventCard
            title="Already"
            subtitle="Registered"
            date="15 Dec"
            time="8:30 PM GMT"
            venue="Tech Lounge"
            address="Art House Rd, London SW8 1LW, United Kingdom"
            imageUrl="https://images.unsplash.com/photo-1511578314322-379afb476865?w=800"
            gradientFrom="from-rose-500/80"
            gradientTo="to-orange-500/80"
            onClick={handleExistingUser}
          />
        </div>
      </div>
      {showStepper && (
        <RegistrationStepper mode={showStepper} onClose={() => setShowStepper(false)} />
      )}
    </>
  );
};

export default EventRegistrationCards;