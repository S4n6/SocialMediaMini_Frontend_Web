import { createSystem, defaultConfig } from "@chakra-ui/react";

const theme = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: "#e3f2fd" },
          100: { value: "#bbdefb" },
          200: { value: "#90caf9" },
          300: { value: "#64b5f6" },
          400: { value: "#42a5f5" },
          500: { value: "#2196f3" },
          600: { value: "#1e88e5" },
          700: { value: "#1976d2" },
          800: { value: "#1565c0" },
          900: { value: "#0d47a1" },
        },
      },
    },
    semanticTokens: {
      colors: {
        bg: {
          canvas: {
            value: {
              base: "#f7fafc",
              _dark: "#0d2390ff",
            },
          },
          surface: {
            value: {
              base: "#ebf8ff",
              _dark: "#2d3748",
            },
          },
          elevated: {
            value: {
              base: "#ffffff",
              _dark: "#4a5568",
            },
          },
        },
        text: {
          primary: {
            value: {
              base: "#1a202c",
              _dark: "#ffffff",
            },
          },
          secondary: {
            value: {
              base: "#718096",
              _dark: "#a0aec0",
            },
          },
        },
      },
    },
  },
});

export default theme;
