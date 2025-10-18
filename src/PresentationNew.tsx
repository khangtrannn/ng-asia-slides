import React from 'react';
import { usePresentation } from './hooks/usePresentation';
import { slides } from './data/slides';
import ProgressBar from './components/ProgressBar';

const PresentationNew: React.FC = () => {
  const { currentSlide } = usePresentation({ totalSlides: slides.length });

  return (
    <div className="w-screen h-screen bg-gray-950 text-white overflow-hidden flex flex-col">
      <ProgressBar currentSlide={currentSlide} totalSlides={slides.length} />

      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <div className={`w-full h-full max-w-[1920px] flex flex-col ${currentSlide === 0 ? '' : 'p-8 pb-0'}`} style={{ viewTransitionName: 'slide-content' }}>
          <div className={`${currentSlide === 0 ? '' : 'mb-4'}`}>
            <h1 className="text-3xl font-bold mb-1">{slides[currentSlide].title}</h1>
            <h2 className="text-lg text-gray-400">{slides[currentSlide].subtitle}</h2>
          </div>
          
          {currentSlide === 0 ? (
            <div className='flex-1'>
              {slides[currentSlide].content}
            </div>
          ) : (
            <div className="flex-1 rounded-lg pt-6 overflow-auto">
              <div className='pb-8'>
                {slides[currentSlide].content}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PresentationNew;
