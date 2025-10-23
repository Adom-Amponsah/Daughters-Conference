import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { RegistrationCardProps } from '../types';

const RegistrationCard: React.FC<RegistrationCardProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  color, 
  onClick 
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  
  return (
    <div
      className={`relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-500 ${
        isHovered ? 'transform -translate-y-2 shadow-2xl' : 'shadow-xl'
      }`}
      style={{
        background: `linear-gradient(135deg, ${color.primary} 0%, ${color.secondary} 100%)`,
        minHeight: '320px'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl" 
             style={{ background: 'white' }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl" 
             style={{ background: 'white' }} />
      </div>
      
      {/* Card Content */}
      <div className="relative p-8 h-full flex flex-col justify-between">
        <div>
          <div className={`inline-flex p-4 rounded-2xl bg-white bg-opacity-20 backdrop-blur-sm mb-6 transition-transform duration-500 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
          
          <h3 className="text-3xl font-bold text-white mb-3">{title}</h3>
          <p className="text-white text-opacity-90 text-lg leading-relaxed">
            {description}
          </p>
        </div>
        
        <div className="flex items-center justify-between mt-6">
          <span className="text-white font-semibold text-lg">Get Started</span>
          <div className={`transition-transform duration-300 ${
            isHovered ? 'translate-x-2' : 'translate-x-0'
          }`}>
            <ArrowRight className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationCard;