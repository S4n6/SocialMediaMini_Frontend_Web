"use client";

import React from "react";

export default function MessagesPage() {
  return (
    <div className="flex w-full">
      <div className="w-full p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Messages</h1>
          <p className="text-muted-foreground">
            Your conversations and direct messages will appear here.
          </p>
          {/* Add messages content here */}
        </div>
      </div>
    </div>
  );
}
