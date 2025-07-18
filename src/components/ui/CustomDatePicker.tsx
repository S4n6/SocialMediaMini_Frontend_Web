"use client";

import React, { useState } from "react";
import { Input, Box, Text } from "@chakra-ui/react";

interface CustomDatePickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isRequired?: boolean;
  error?: string;
}

/**
 * Custom DatePicker with dd/MM/yyyy format display
 * Alternative implementation for better format control
 */
export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  label,
  value,
  onChange,
  placeholder = "dd/MM/yyyy",
  isRequired = false,
  error,
}) => {
  const [inputValue, setInputValue] = useState(value);

  // Format date string as dd/MM/yyyy
  const formatDate = (input: string): string => {
    // Remove all non-numeric characters
    const numbers = input.replace(/\D/g, "");

    // Format as dd/MM/yyyy
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(
        4,
        8
      )}`;
    }
  };

  // Validate date
  const isValidDate = (dateStr: string): boolean => {
    if (dateStr.length !== 10) return false;

    const [day, month, year] = dateStr.split("/").map(Number);
    const date = new Date(year, month - 1, day);

    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day &&
      year >= 1900 &&
      year <= new Date().getFullYear() - 13
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDate(e.target.value);
    setInputValue(formatted);

    if (formatted.length === 10 && isValidDate(formatted)) {
      onChange(formatted);
    } else if (formatted.length === 0) {
      onChange("");
    }
  };

  const handleBlur = () => {
    if (inputValue.length === 10 && isValidDate(inputValue)) {
      onChange(inputValue);
    } else if (inputValue.length > 0 && inputValue.length < 10) {
      setInputValue(value);
    }
  };

  return (
    <Box>
      {label && (
        <Text
          fontWeight="medium"
          mb={2}
          color={{ base: "gray.700", _dark: "gray.200" }}
        >
          {label}
        </Text>
      )}
      <Input
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        maxLength={10}
        p={4}
        width="100%"
        borderRadius="lg"
        boxShadow="sm"
        color={{ base: "gray.900", _dark: "white" }}
        bg={{ base: "white", _dark: "gray.700" }}
        border="1px solid"
        borderColor={{ base: "gray.300", _dark: "gray.600" }}
        _invalid={{
          borderColor: "red.500",
          boxShadow: "0 0 0 1px red.500",
        }}
        aria-label={label || "Enter date in dd/MM/yyyy format"}
      />

      {error && (
        <Text color="red.500" fontSize="sm" mt={1}>
          {error}
        </Text>
      )}
    </Box>
  );
};
