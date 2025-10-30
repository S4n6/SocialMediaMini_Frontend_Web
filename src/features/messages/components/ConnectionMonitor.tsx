'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Activity,
  Wifi,
  WifiOff,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Trash2,
  Monitor,
  Signal,
} from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useNetworkStatus } from '../utils/network-monitor';
import {
  wsErrorHandler,
  WebSocketError,
} from '../utils/websocket-error-handler';

interface ConnectionStatusMonitorProps {
  className?: string;
}

export function ConnectionStatusMonitor({
  className = '',
}: ConnectionStatusMonitorProps) {
  const { isConnected, isConnecting, connectionStatus, service } = useWebSocket(
    { autoConnect: false },
  );

  const networkStatus = useNetworkStatus();
  const [errors, setErrors] = useState<WebSocketError[]>([]);
  const [updateCounter, setUpdateCounter] = useState(0);

  // Update error log periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const recentErrors = wsErrorHandler.getRecentErrors(60); // Last hour
      setErrors(recentErrors);
      setUpdateCounter((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'connecting':
        return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNetworkStatusIcon = () => {
    if (!networkStatus.isOnline) {
      return <WifiOff className="h-4 w-4 text-red-500" />;
    }

    const quality = networkStatus.connectionQuality;
    switch (quality) {
      case 'excellent':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'good':
        return <Wifi className="h-4 w-4 text-blue-500" />;
      case 'poor':
        return <Signal className="h-4 w-4 text-orange-500" />;
      default:
        return <Wifi className="h-4 w-4 text-gray-500" />;
    }
  };

  const getConnectionQualityBadge = () => {
    const quality = networkStatus.connectionQuality;
    const colorMap = {
      excellent: 'bg-green-100 text-green-800',
      good: 'bg-blue-100 text-blue-800',
      poor: 'bg-orange-100 text-orange-800',
      offline: 'bg-red-100 text-red-800',
    };

    return (
      <Badge variant="secondary" className={colorMap[quality]}>
        {quality.toUpperCase()}
      </Badge>
    );
  };

  const clearErrors = () => {
    wsErrorHandler.clearErrorLog();
    setErrors([]);
  };

  const shouldUseFallback = service?.shouldUseFallbackMode() || false;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Monitor className="h-4 w-4" />
          Connection Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">WebSocket Status</span>
            <div className="flex items-center gap-2">
              {getConnectionStatusIcon()}
              <Badge variant={isConnected ? 'default' : 'destructive'}>
                {connectionStatus.toUpperCase()}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Network Status</span>
            <div className="flex items-center gap-2">
              {getNetworkStatusIcon()}
              {getConnectionQualityBadge()}
            </div>
          </div>
        </div>

        <Separator />

        {/* Network Details */}
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Connection Type:</span>
            <span>{networkStatus.connectionType || 'Unknown'}</span>
          </div>
          <div className="flex justify-between">
            <span>Effective Type:</span>
            <span>{networkStatus.effectiveConnectionType || 'Unknown'}</span>
          </div>
          {networkStatus.downlink && (
            <div className="flex justify-between">
              <span>Bandwidth:</span>
              <span>{networkStatus.downlink.toFixed(1)} Mbps</span>
            </div>
          )}
          {networkStatus.rtt && (
            <div className="flex justify-between">
              <span>Latency:</span>
              <span>{networkStatus.rtt}ms</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Fallback Mode Indicator */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Mode</span>
          <Badge variant={shouldUseFallback ? 'destructive' : 'default'}>
            {shouldUseFallback ? 'HTTP FALLBACK' : 'WEBSOCKET'}
          </Badge>
        </div>

        {/* Error Summary */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Recent Errors ({errors.length})
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={clearErrors}
              className="h-6 px-2 text-xs"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>

          {errors.length > 0 && (
            <ScrollArea className="h-20 w-full border rounded p-2">
              <div className="space-y-1">
                {errors.slice(0, 5).map((error, index) => (
                  <div key={index} className="text-xs">
                    <div className="flex items-center gap-1">
                      <Clock className="h-2 w-2" />
                      <span className="text-muted-foreground">
                        {error.timestamp.toLocaleTimeString()}
                      </span>
                      <Badge variant="outline" className="h-4 px-1 text-xs">
                        {error.type}
                      </Badge>
                    </div>
                    <p className="text-red-600 dark:text-red-400 ml-3">
                      {error.message}
                    </p>
                  </div>
                ))}
                {errors.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{errors.length - 5} more errors...
                  </p>
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Live Counter */}
        <div className="text-xs text-muted-foreground text-center">
          Last updated: {new Date().toLocaleTimeString()}
          <span className="ml-2">({updateCounter})</span>
        </div>
      </CardContent>
    </Card>
  );
}

// WebSocket Event Logger Component
export function WebSocketEventLogger({
  className = '',
}: {
  className?: string;
}) {
  const [events, setEvents] = useState<
    Array<{
      id: string;
      type: string;
      timestamp: Date;
      data: any;
      direction: 'incoming' | 'outgoing';
    }>
  >([]);

  const { service } = useWebSocket({ autoConnect: false });
  const maxEvents = 50;

  const addEvent = (
    type: string,
    data: any,
    direction: 'incoming' | 'outgoing',
  ) => {
    const event = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      timestamp: new Date(),
      data,
      direction,
    };

    setEvents((prev) => [event, ...prev.slice(0, maxEvents - 1)]);
  };

  // Monitor WebSocket service for events (this would need to be implemented in the service)
  useEffect(() => {
    if (!service) return;

    // In a real implementation, you'd need to add event logging to the WebSocket service
    // For now, we'll simulate some events
    const interval = setInterval(() => {
      if (service.isConnected()) {
        // Simulate heartbeat
        addEvent('heartbeat', { status: 'alive' }, 'outgoing');
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [service]);

  const clearEvents = () => {
    setEvents([]);
  };

  const getEventIcon = (type: string, direction: 'incoming' | 'outgoing') => {
    const iconClass =
      direction === 'incoming' ? 'text-blue-500' : 'text-green-500';
    return <Activity className={`h-3 w-3 ${iconClass}`} />;
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            WebSocket Events ({events.length})
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={clearEvents}
            className="h-6 px-2 text-xs"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64 w-full">
          <div className="space-y-2">
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No events logged yet
              </p>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className="border rounded p-2 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getEventIcon(event.type, event.direction)}
                      <span className="font-medium">{event.type}</span>
                      <Badge
                        variant="outline"
                        className={`h-4 px-1 text-xs ${
                          event.direction === 'incoming'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-green-50 text-green-600'
                        }`}
                      >
                        {event.direction}
                      </Badge>
                    </div>
                    <span className="text-muted-foreground">
                      {event.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <pre className="text-xs bg-muted p-1 rounded overflow-auto">
                    {JSON.stringify(event.data, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
