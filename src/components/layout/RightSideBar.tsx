import React from "react";
import { Footer } from "./Footer";

interface RightSideBarProps {
  showFriendSuggestions?: boolean;
}

export default function RightSideBar() {
  return (
    <div className="w-full flex flex-col gap-6">
      {/* Additional sidebar content can be added here */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Trending</h3>
        <div className="space-y-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            #NextJS trending in Technology
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            #React trending in Programming
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            #TypeScript trending in Development
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
