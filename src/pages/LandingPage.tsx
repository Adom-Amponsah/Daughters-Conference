import React from 'react';
import { UserPlus, LogIn } from 'lucide-react';
import Header from '../components/Header';
import RegistrationCard from '../components/RegistrationCard';
import ArchCarousel from '../components/ArchCarousel';
import EventRegistrationCards from '../components/EventCard';


const images = [
  "https://i.postimg.cc/JzmjVGpW/Whats-App-Image-2025-10-22-at-4-23-49-PM.jpg",
  "https://i.postimg.cc/FRXGnBg4/Chat-GPT-Image-Oct-22-2025-03-23-09-PM.png",
  "https://i.postimg.cc/FRXGnBg4/Chat-GPT-Image-Oct-22-2025-03-23-09-PM.png",
  "https://i.postimg.cc/FRXGnBg4/Chat-GPT-Image-Oct-22-2025-03-23-09-PM.png",
  "https://i.postimg.cc/FRXGnBg4/Chat-GPT-Image-Oct-22-2025-03-23-09-PM.png",
  "https://i.postimg.cc/FRXGnBg4/Chat-GPT-Image-Oct-22-2025-03-23-09-PM.png",
  "https://i.postimg.cc/FRXGnBg4/Chat-GPT-Image-Oct-22-2025-03-23-09-PM.png",
  "https://i.postimg.cc/FRXGnBg4/Chat-GPT-Image-Oct-22-2025-03-23-09-PM.png",
];
const LandingPage: React.FC = () => {
  const handleNewRegistration = (): void => {
    console.log('Navigate to new registration');
    alert('Navigating to New Registration Form');
  };
  
  const handleExistingUser = (): void => {
    console.log('Navigate to login');
    alert('Navigating to Login Page');
  };
  
  return (
    <div className="min-h-screen relative overflow-hidden p-0 m-0">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://i.postimg.cc/FRXGnBg4/Chat-GPT-Image-Oct-22-2025-03-23-09-PM.png)',
        }}
      >
        {/* <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 opacity-75" /> */}
        <div className="absolute inset-0 bg-black opacity-50" />
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
    </div>
  );
};

export default LandingPage;