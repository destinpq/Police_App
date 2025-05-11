import { useEffect, useState } from 'react';

// Breakpoints based on common device sizes
export const breakpoints = {
  xs: 480,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
};

// Hook for detecting current screen size
export const useBreakpoint = () => {
  const [screenWidth, setScreenWidth] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isTablet, setIsTablet] = useState<boolean>(false);
  const [isDesktop, setIsDesktop] = useState<boolean>(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    // Set initial width
    setScreenWidth(window.innerWidth);
    
    // Update the screen width on resize
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Update breakpoint states when screen width changes
  useEffect(() => {
    setIsMobile(screenWidth < breakpoints.md);
    setIsTablet(screenWidth >= breakpoints.md && screenWidth < breakpoints.lg);
    setIsDesktop(screenWidth >= breakpoints.lg);
  }, [screenWidth]);

  return {
    screenWidth,
    isMobile,
    isTablet,
    isDesktop,
    // Return individual breakpoint checks
    xs: screenWidth < breakpoints.sm,
    sm: screenWidth >= breakpoints.sm && screenWidth < breakpoints.md,
    md: screenWidth >= breakpoints.md && screenWidth < breakpoints.lg,
    lg: screenWidth >= breakpoints.lg && screenWidth < breakpoints.xl,
    xl: screenWidth >= breakpoints.xl && screenWidth < breakpoints.xxl,
    xxl: screenWidth >= breakpoints.xxl,
  };
}; 