import { useState, useEffect } from 'react';

interface UsePresentationProps {
  totalSlides: number;
}

export const usePresentation = ({ totalSlides }: UsePresentationProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (!document.startViewTransition) {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
      return;
    }
    
    document.startViewTransition(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    });
  };

  const prevSlide = () => {
    if (!document.startViewTransition) {
      setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
      return;
    }
    
    document.startViewTransition(() => {
      setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    });
  };

  const goToSlide = (slideIndex: number) => {
    if (!document.startViewTransition) {
      setCurrentSlide(slideIndex);
      return;
    }
    
    document.startViewTransition(() => {
      setCurrentSlide(slideIndex);
    });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          if (currentSlide > 0) prevSlide();
          break;
        case 'ArrowRight':
          if (currentSlide < totalSlides - 1) nextSlide();
          break;
        case ' ':
          event.preventDefault();
          if (currentSlide < totalSlides - 1) nextSlide();
          break;
        case 'Home':
          goToSlide(0);
          break;
        case 'End':
          goToSlide(totalSlides - 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, totalSlides]);

  return {
    currentSlide,
    nextSlide,
    prevSlide,
    goToSlide
  };
};
