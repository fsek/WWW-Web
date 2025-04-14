"use client";

import { FC, useEffect, useState, useRef } from "react";

interface CustomTitleProps {
  text: string;
  className?: string;
}

const CustomTitle: FC<CustomTitleProps> = ({ text, className }) => {
  const [animationState, setAnimationState] = useState<'initial' | 'text-width' | 'full-width'>('initial');
  const textRef = useRef<HTMLDivElement>(null);
  const underlineRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!textRef.current) return;
    
    // First set the underline to match text width without animation
    if (underlineRef.current && textRef.current) {
      const width = textRef.current.offsetWidth;
      underlineRef.current.style.width = `${width}px`;
      underlineRef.current.style.transition = 'none';
    }
    
    // Small delay to ensure the text width is applied before animation
    requestAnimationFrame(() => {
      setAnimationState('text-width');
      
      // Then enable the transition and animate to full width
      const timeoutId = setTimeout(() => {
        if (underlineRef.current) {
          underlineRef.current.style.transition = 'width 700ms ease-in-out';
          setAnimationState('full-width');
        }
      }, 1000);
      
      return () => {
        clearTimeout(timeoutId);
      };
  }, []);

  return (
    <div className="w-full">
      <div 
        ref={textRef} 
        className={`inline-block text-2xl font-bold text-left text-orange-500 ${className}`}
      >
        {text}
      </div>
      <div 
        ref={underlineRef} 
        className="h-0.5 bg-orange-500 mt-1"
        style={{ 
          width: animationState === 'full-width' ? '100%' : 'auto'
        }}
      />
    </div>
  );
};

export default CustomTitle;


