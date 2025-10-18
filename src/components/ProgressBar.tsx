import React from 'react';

interface ProgressBarProps {
  currentSlide: number;
  totalSlides: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentSlide, totalSlides }) => (
  <div className="w-full">
    <div className="max-w-[1920px] mx-auto flex items-center gap-4 text-xs text-gray-500">
      <div className="flex-1 bg-gray-800 rounded-full h-1">
        <div
          className="bg-blue-500 h-1 rounded-full transition-all duration-300"
          style={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
        />
      </div>
    </div>
  </div>
);

export default ProgressBar;
