import React from "react";
import { useRouter } from "next/navigation";
import { IoClose } from "react-icons/io5";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useLegacyUser as useUser } from "@/hooks/user";
import { useSearchHistory } from "@/hooks";
import { SearchHistoryItem } from "@/types/search-history";
import SearchInput from "./SearchInput";
import SearchSuggestions from "./SearchSuggestions";
import SearchResults from "./SearchResults";
import SearchHistoryList from "./SearchHistoryList";

interface SearchDrawerProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
}

export default function SearchDrawer({
  isOpen,
  isCollapsed,
  onClose,
}: SearchDrawerProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");
  const router = useRouter();
  const drawerRef = React.useRef<HTMLDivElement>(null);

  // Use search history hook
  const {
    searchHistory,
    isLoadingHistory,
    clearHistory,
    removeUserFromHistory,
    addUserToHistory,
    getSearchSuggestions,
    hasHistory,
  } = useSearchHistory();

  // Debounce the search query
  React.useEffect(() => {
    const handler = setTimeout(() => {
      const trimmedQuery = searchQuery.trim();
      setDebouncedQuery(trimmedQuery);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Use the search hook with debounced query
  const {
    searchResults = [],
    isLoadingSearch: isLoading,
    searchError: error,
  } = useUser({ searchQuery: debouncedQuery });

  const isError = !!error;

  // Event handlers
  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleSearchEnter = () => {
    setDebouncedQuery(searchQuery.trim());
  };

  const handleUserClick = (userId: string) => {
    addUserToHistory(userId);
    router.push(`/profile/${userId}`);
    onClose();
  };

  const handleHistoryItemClick = (item: SearchHistoryItem) => {
    router.push(`/profile/${item.userId}`);
    onClose();
  };

  const handleHistoryItemRemove = (userId: string) => {
    removeUserFromHistory(userId);
  };

  const handleClearAllHistory = () => {
    clearHistory();
  };

  // Handle click outside to close drawer
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Ignore clicks that originate from the search toggle (so clicking the search button
      // doesn't immediately re-open the drawer after an outside-click close).
      const target = event.target as HTMLElement | null;
      if (target) {
        const toggleEl =
          target.closest && target.closest("[data-search-toggle]");
        if (toggleEl) return;
      }

      if (
        isOpen &&
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Get search suggestions
  const suggestions = React.useMemo(() => {
    return searchQuery.trim() && !debouncedQuery
      ? getSearchSuggestions(searchQuery)
      : [];
  }, [searchQuery, debouncedQuery, getSearchSuggestions]);

  return (
    <>
      {/* Search Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 left-0 h-screen z-20 border-r border-gray-200 w-96 transition-all duration-300 ease-in-out overflow-y-auto ${
          isOpen
            ? "translate-x-0 opacity-100 bg-[var(--color-background)]"
            : "-translate-x-full opacity-0 pointer-events-none"
        }`}
        style={{
          left: isCollapsed ? "80px" : "256px",
        }}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Search</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="w-8 h-8 p-0"
            >
              <IoClose className="w-5 h-5" />
            </Button>
          </div>

          {/* Search Input */}
          <SearchInput
            value={searchQuery}
            onChange={handleSearchInputChange}
            onEnter={handleSearchEnter}
            className="mb-6"
          />

          <Separator className="mb-6" />

          {/* Content Area */}
          <div>
            {suggestions.length > 0 ? (
              <SearchSuggestions
                suggestions={suggestions}
                onSuggestionClick={handleHistoryItemClick}
              />
            ) : debouncedQuery ? (
              <>
                <h3 className="text-base font-semibold mb-4">Results</h3>
                <SearchResults
                  query={debouncedQuery}
                  results={searchResults}
                  isLoading={isLoading}
                  isError={isError}
                  error={error}
                  onUserClick={handleUserClick}
                />
              </>
            ) : (
              <SearchHistoryList
                history={searchHistory}
                isLoading={isLoadingHistory}
                hasHistory={hasHistory}
                onItemClick={handleHistoryItemClick}
                onItemRemove={handleHistoryItemRemove}
                onClearAll={handleClearAllHistory}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
