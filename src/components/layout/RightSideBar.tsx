import React from "react";
import FriendSuggestionSection from "../friend-suggestion/friendSuggestionSection";
import { Footer } from "./Footer";

export default function RightSideBar() {
  return (
    <div className="w-full p-2 md:p-4 lg:p-6 bg-background">
      <div className="flex flex-col gap-6">
        <FriendSuggestionSection />
        <Footer />
      </div>
    </div>
  );
}
