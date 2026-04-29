import { useEffect, useRef, useState } from 'react';

export function usePerformanceMonitor(componentName) {
  const startTime = useRef(Date.now());
  const renderCount = useRef(0);
  
  useEffect(() => {
    renderCount.current++;
    const renderTime = Date.now() - startTime.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance: ${componentName} - Render #${renderCount.current} took ${renderTime}ms`);
    }
    
    if (renderTime > 100) {
      console.warn(`Slow render detected in ${componentName}: ${renderTime}ms`);
    }
  });
  
  return {
    renderCount: renderCount.current,
    renderTime: Date.now() - startTime.current
  };
}

export function usePageLoadMetrics() {
  const [metrics, setMetrics] = useState(null);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && window.performance) {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');
        
        const metricsData = {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          domInteractive: navigation.domInteractive - navigation.fetchStart,
          firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
          firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
          totalLoadTime: navigation.loadEventEnd - navigation.fetchStart,
          networkTime: navigation.responseEnd - navigation.fetchStart,
          serverTime: navigation.responseEnd - navigation.requestStart,
        };
        
        setMetrics(metricsData);
        
        if (process.env.NODE_ENV === 'development') {
          console.group('Page Performance Metrics');
          console.log('DOM Content Loaded:', metricsData.domContentLoaded + 'ms');
          console.log('Load Complete:', metricsData.loadComplete + 'ms');
          console.log('First Paint:', metricsData.firstPaint + 'ms');
          console.log('First Contentful Paint:', metricsData.firstContentfulPaint + 'ms');
          console.log('Total Load Time:', metricsData.totalLoadTime + 'ms');
          console.groupEnd();
        }
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  return metrics;
}

export function useMemoryMonitor() {
  const [memoryInfo, setMemoryInfo] = useState(null);
  
  useEffect(() => {
    const updateMemoryInfo = () => {
      if (typeof window !== 'undefined' && window.performance && window.performance.memory) {
        const memory = window.performance.memory;
        setMemoryInfo({
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
          usage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100)
        });
      }
    };
    
    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return memoryInfo;
}

// PerformanceDebugger component removed to avoid build issues
// Can be re-added later if needed
export function PerformanceDebugger() {
  return null;
}