"use client";

import React from "react";

interface IPhoneMockupProps {
  children: React.ReactNode;
  className?: string;
}

export const IPhoneMockup = ({ children, className = "" }: IPhoneMockupProps) => {
  return (
    <div className={`relative ${className}`}>
      <div className="relative mx-auto border-gray-900 bg-gray-900 border-[8px] rounded-[3.5rem] h-[720px] w-[360px] overflow-hidden">
        <div className="absolute top-24 -left-2.5 w-1 h-12 bg-gray-800 rounded-r-lg" />
        <div className="absolute top-40 -left-2.5 w-1 h-20 bg-gray-800 rounded-r-lg" />
        <div className="absolute top-64 -left-2.5 w-1 h-20 bg-gray-800 rounded-r-lg" />
        <div className="absolute top-40 -right-2.5 w-1 h-24 bg-gray-800 rounded-l-lg" />

<div className="relative overflow-hidden w-full h-full bg-black rounded-[2.5rem]">
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-50 flex items-center justify-end px-3 gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-gray-800" />
               <div className="w-3 h-3 rounded-full bg-gray-900 border border-gray-800" />
            </div>

            <div className="absolute inset-0 overflow-hidden">
              {children}
            </div>
          </div>
      </div>

      <div className="absolute inset-0 pointer-events-none rounded-[3.5rem] ring-1 ring-inset ring-white/20 z-40" />
    </div>
  );
};
