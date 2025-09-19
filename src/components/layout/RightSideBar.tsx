import React from "react";
import FriendSuggestionSection from "../friend-suggestion/friendSuggestionSection";
import { Footer } from "./Footer";

export default function RightSideBar() {
  return (
    <div className="w-full flex flex-col gap-6">
      <FriendSuggestionSection />
      <Footer />
    </div>
  );
}
