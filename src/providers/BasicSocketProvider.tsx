"use client";

import React, { createContext, useContext } from "react";

// Simple Socket Context - Basic version for future implementation
interface BasicSocketContextValue {
  isConnected: boolean;
  emit: (event: string, data?: any) => void;
  on: (event: string, handler: Function) => void;
  off: (event: string, handler?: Function) => void;
}

const BasicSocketContext = createContext<BasicSocketContextValue | undefined>(
  undefined
);

export function useSocket() {
  const context = useContext(BasicSocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a BasicSocketProvider");
  }
  return context;
}

interface BasicSocketProviderProps {
  children: React.ReactNode;
}

export function BasicSocketProvider({ children }: BasicSocketProviderProps) {
  // Basic implementation - can be extended when real-time features are needed
  const contextValue: BasicSocketContextValue = {
    isConnected: false,
    emit: (event: string, data?: any) => {
      console.log("Socket emit (mock):", event, data);
    },
    on: (event: string, handler: Function) => {
      console.log("Socket on (mock):", event);
    },
    off: (event: string, handler?: Function) => {
      console.log("Socket off (mock):", event);
    },
  };

  return (
    <BasicSocketContext.Provider value={contextValue}>
      {children}
    </BasicSocketContext.Provider>
  );
}

// Keep these exports for compatibility
export const useSocketConnection = () => {
  const { isConnected } = useSocket();
  return {
    isConnected,
    connect: () => console.log("Socket connect (mock)"),
    disconnect: () => console.log("Socket disconnect (mock)"),
    connectionState: "disconnected" as const,
  };
};

export const useSocketEvent = (
  event: string,
  handler: Function,
  deps?: any[]
) => {
  // Mock implementation
  console.log("useSocketEvent (mock):", event);
};
