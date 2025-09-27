"use client";

import React from "react";
import { LuSearch } from "react-icons/lu";
import { IoClose } from "react-icons/io5";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onEnter?: () => void;
  placeholder?: string;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onEnter,
  placeholder = "Search users...",
  className,
}) => {
  return (
    <div className={`relative ${className}`}>
      <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <Input
        placeholder={placeholder}
        className="pl-10 rounded-lg border py-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && value.trim() && onEnter) {
            onEnter();
          }
        }}
      />
      {value && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 p-0"
        >
          <IoClose className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

export default SearchInput;
