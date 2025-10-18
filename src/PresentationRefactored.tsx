import React, { useState } from 'react';
import { usePresentation } from './hooks/usePresentation';
import ProgressBar from './components/ProgressBar';
import CodeBlock from './components/CodeBlock';
import TitleSlide from './components/TitleSlide';
import { Zap, AlertTriangle } from 'lucide-react';

// Import slides from the original file
import { slides as originalSlides } from './Presentation';

const PresentationRefactored: React.FC = () => {
  const { currentSlide } = usePresentation({ totalSlides: originalSlides.length });

  return (
    <div className="w-screen h-screen bg-gray-950 text-white overflow-hidden flex flex-col">
      <ProgressBar currentSlide={currentSlide} totalSlides={originalSlides.length} />

      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <div className={`w-full h-full max-w-[1920px] flex flex-col ${currentSlide === 0 ? '' : 'p-8 pb-0'}`} style={{ viewTransitionName: 'slide-content' }}>
          <div className={`${currentSlide === 0 ? '' : 'mb-4'}`}>
            <h1 className="text-3xl font-bold mb-1">{originalSlides[currentSlide].title}</h1>
            <h2 className="text-lg text-gray-400">{originalSlides[currentSlide].subtitle}</h2>
          </div>
          
          {currentSlide === 0 ? (
            <div className='flex-1'>
              {originalSlides[currentSlide].content}
            </div>
          ) : (
            <div className="flex-1 rounded-lg pt-6 overflow-auto">
              <div className='pb-8'>
                {originalSlides[currentSlide].content}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PresentationRefactored;
