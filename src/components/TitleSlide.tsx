import React from 'react';

const TitleSlide: React.FC = () => (
  <div className="h-full w-full grid grid-cols-10 gap-0 p-0 m-0 relative bg-black">
    <img className="absolute top-4 left-8 w-16 h-16" src="/images/angular.png" alt="Angular" />
    <div className="flex flex-col col-span-6 justify-center px-4 pl-8">
      <h1 className="mt-[-90px] text-[60px] font-bold mb-2">The Beauties of Signals</h1>
      <p className="text-[30px] italic text-gray-400">From Change Detection To Synchronization</p>
    </div>
    <div className="col-span-4 h-full relative">
      <img 
        src="/images/introduction.png" 
        className="absolute inset-0 h-full w-full object-cover" 
        alt="Traffic light"
      />
    </div>
    <div className="absolute bottom-8 left-8 flex gap-4 items-center">
      <img 
        className="border-4 border-white w-24 h-24 object-cover rounded-full" 
        src="/images/avatar.jpeg" 
        alt="Khang Tran"
      />
      <div className="flex flex-col justify-center">
        <span className="text-[26px] font-semibold">Khang Tran</span>
        <span className="italic text-gray-400">Angular Enthusiast</span>
      </div>
    </div>
  </div>
);

export default TitleSlide;
