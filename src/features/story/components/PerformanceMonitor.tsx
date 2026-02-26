'use client';

import { useEffect, useRef, useState } from 'react';

// Simple performance monitor for fresher level
interface PerformanceMetrics {
  renderCount: number;
  averageRenderTime: number;
  slowRenders: number;
  memoryUsage?: {
    used: number;
    total: number;
    limit: number;
  };
}

class SimplePerformanceMonitor {
  private metrics = new Map<string, PerformanceMetrics>();
  private renderTimes = new Map<string, number[]>();

  // Track component render
  trackRender(componentName: string, renderTime?: number) {
    const current = this.metrics.get(componentName) || {
      renderCount: 0,
      averageRenderTime: 0,
      slowRenders: 0,
    };

    current.renderCount++;

    if (renderTime !== undefined) {
      const times = this.renderTimes.get(componentName) || [];
      times.push(renderTime);

      // Keep only last 20 render times
      if (times.length > 20) {
        times.shift();
      }

      this.renderTimes.set(componentName, times);

      // Calculate average
      current.averageRenderTime =
        times.reduce((a, b) => a + b, 0) / times.length;

      // Count slow renders (over 16ms for 60fps)
      if (renderTime > 16) {
        current.slowRenders++;
      }
    }

    this.metrics.set(componentName, current);
  }

  // Get metrics for a component
  getMetrics(componentName: string): PerformanceMetrics | null {
    return this.metrics.get(componentName) || null;
  }

  // Get all metrics
  getAllMetrics(): Record<string, PerformanceMetrics> {
    const result: Record<string, PerformanceMetrics> = {};
    this.metrics.forEach((metrics, name) => {
      result[name] = { ...metrics };
    });
    return result;
  }

  // Clear metrics
  clear() {
    this.metrics.clear();
    this.renderTimes.clear();
  }

  // Log performance report
  logReport() {
    if (process.env.NODE_ENV !== 'development') return;

    console.group('📊 Performance Report');
    this.metrics.forEach((metrics, componentName) => {
      console.log(`${componentName}:`, {
        renders: metrics.renderCount,
        averageTime: `${metrics.averageRenderTime.toFixed(2)}ms`,
        slowRenders: metrics.slowRenders,
        percentage: `${((metrics.slowRenders / metrics.renderCount) * 100).toFixed(1)}%`,
      });
    });
    console.groupEnd();
  }
}

// Export singleton
export const performanceMonitor = new SimplePerformanceMonitor();

// Hook to track component performance
export const usePerformanceTracker = (componentName: string) => {
  const renderStartTime = useRef<number | undefined>(undefined);
  const renderCount = useRef(0);

  // Track render start
  useEffect(() => {
    renderStartTime.current = performance.now();
  });

  // Track render end
  useEffect(() => {
    if (renderStartTime.current) {
      const renderTime = performance.now() - renderStartTime.current;
      performanceMonitor.trackRender(componentName, renderTime);
      renderCount.current++;

      // Log slow renders in development
      if (process.env.NODE_ENV === 'development' && renderTime > 16) {
        console.warn(
          `⚠️ Slow render: ${componentName} took ${renderTime.toFixed(2)}ms`,
        );
      }
    }
  });

  return {
    renderCount: renderCount.current,
    getMetrics: () => performanceMonitor.getMetrics(componentName),
  };
};

// Hook to monitor memory usage
export const useMemoryMonitor = (interval: number = 5000) => {
  const [memoryInfo, setMemoryInfo] = useState<{
    used: number;
    total: number;
    limit: number;
  } | null>(null);

  useEffect(() => {
    const checkMemory = () => {
      if ('memory' in performance && process.env.NODE_ENV === 'development') {
        const memory = (performance as any).memory;
        const info = {
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
          limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024), // MB
        };
        setMemoryInfo(info);

        // Warn if memory usage is high
        const usage = (info.used / info.limit) * 100;
        if (usage > 80) {
          console.warn(
            `🚨 High memory usage: ${usage.toFixed(1)}% (${info.used}MB/${info.limit}MB)`,
          );
        }
      }
    };

    checkMemory();
    const intervalId = setInterval(checkMemory, interval);

    return () => clearInterval(intervalId);
  }, [interval]);

  return memoryInfo;
};

// Hook for simple performance debugging
export const usePerformanceDebugger = (enabled: boolean = false) => {
  const [isEnabled, setIsEnabled] = useState(
    enabled && process.env.NODE_ENV === 'development',
  );

  const logPerformance = (name: string, fn: () => void) => {
    if (!isEnabled) {
      fn();
      return;
    }

    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`);
  };

  const startTimer = (name: string) => {
    if (!isEnabled) return () => {};

    const start = performance.now();
    return () => {
      const end = performance.now();
      console.log(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`);
    };
  };

  return {
    isEnabled,
    toggle: () => setIsEnabled(!isEnabled),
    logPerformance,
    startTimer,
    logReport: () => performanceMonitor.logReport(),
  };
};

// Performance DevTools component for development
export const PerformanceDevTools: React.FC = () => {
  const memoryInfo = useMemoryMonitor();
  const [showTools, setShowTools] = useState(false);
  const [metrics, setMetrics] = useState<Record<string, PerformanceMetrics>>(
    {},
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(performanceMonitor.getAllMetrics());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setShowTools(!showTools)}
        className="bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
        title="Performance Tools"
      >
        📊
      </button>

      {showTools && (
        <div className="absolute bottom-12 right-0 bg-white border rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-y-auto">
          <h3 className="font-bold text-lg mb-3">Performance Monitor</h3>

          {/* Memory Info */}
          {memoryInfo && (
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <h4 className="font-semibold mb-1">Memory Usage</h4>
              <div className="text-sm">
                <div>Used: {memoryInfo.used}MB</div>
                <div>Total: {memoryInfo.total}MB</div>
                <div>Limit: {memoryInfo.limit}MB</div>
                <div className="mt-1">
                  <div className="h-2 bg-gray-200 rounded overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all"
                      style={{
                        width: `${(memoryInfo.used / memoryInfo.limit) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Component Metrics */}
          <div className="space-y-2">
            <h4 className="font-semibold">Component Performance</h4>
            {Object.entries(metrics).map(([name, metric]) => (
              <div key={name} className="text-sm p-2 bg-gray-50 rounded">
                <div className="font-medium">{name}</div>
                <div>Renders: {metric.renderCount}</div>
                <div>Avg: {metric.averageRenderTime.toFixed(2)}ms</div>
                <div>Slow: {metric.slowRenders}</div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => performanceMonitor.logReport()}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Log Report
            </button>
            <button
              onClick={() => {
                performanceMonitor.clear();
                setMetrics({});
              }}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
