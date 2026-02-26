'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Search,
  Filter,
  Calendar as CalendarIcon,
  X,
  Clock,
  User,
  FileText,
  Image,
  Video,
  Music,
  File,
  ArrowUpDown,
  ChevronDown,
  History,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  SearchQuery,
  SearchResult,
  SearchFilters,
  SearchHistoryItem,
  AdvancedSearchOptions,
} from '../types/search';
import {
  mockSearchResults as defaultMockResults,
  mockSearchHistory as defaultMockHistory,
} from '../__fixtures__/search.fixtures';
import { apiService } from '@/services/api.service';

interface MessageSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMessage: (messageId: string, conversationId: string) => void;
  conversations: { id: string; name: string; type: 'direct' | 'group' }[];
  currentUserId: string;
}

export function MessageSearch({
  isOpen,
  onClose,
  onSelectMessage,
  conversations,
  currentUserId,
}: MessageSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedTab, setSelectedTab] = useState<
    'search' | 'filters' | 'history'
  >('search');

  const [filters, setFilters] = useState<SearchFilters>({
    conversations: [],
    users: [],
    messageTypes: [],
    sortBy: 'relevance',
    sortOrder: 'desc',
  });

  const [advancedOptions, setAdvancedOptions] = useState<AdvancedSearchOptions>(
    {
      exactPhrase: false,
      caseSensitive: false,
      includeDeleted: false,
      searchInFiles: false,
      regex: false,
    },
  );

  const [searchHistory, setSearchHistory] =
    useState<SearchHistoryItem[]>(defaultMockHistory);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setIsSearching(true);
    try {
      // TODO: Replace with real API call when backend is ready
      // const response = await apiService.search.searchAll(searchQuery);
      // For now, use fixtures as fallback
      await new Promise((resolve) => setTimeout(resolve, 500));

      const filteredResults = defaultMockResults.filter((result) =>
        result.content.toLowerCase().includes(searchQuery.toLowerCase()),
      );

      setSearchResults(filteredResults);

      // Add to search history
      const historyItem: SearchHistoryItem = {
        id: Date.now().toString(),
        query: searchQuery,
        filters: { ...filters },
        timestamp: new Date().toISOString(),
        resultCount: filteredResults.length,
      };

      setSearchHistory((prev) => [historyItem, ...prev.slice(0, 9)]); // Keep last 10 searches
      toast.success(`Found ${filteredResults.length} results`);
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    onSelectMessage(result.messageId, result.conversationId);
    onClose();
  };

  const handleSelectHistoryItem = (item: SearchHistoryItem) => {
    setSearchQuery(item.query);
    setFilters({ ...filters, ...item.filters });
    setSelectedTab('search');
  };

  const clearFilters = () => {
    setFilters({
      conversations: [],
      users: [],
      messageTypes: [],
      sortBy: 'relevance',
      sortOrder: 'desc',
    });
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <FileText className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'audio':
        return <Music className="h-4 w-4" />;
      case 'file':
        return <File className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 24 * 7) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const renderSearchTab = () => (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex space-x-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search messages..."
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} disabled={isSearching}>
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={showFilters ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {(filters.conversations.length > 0 ||
            filters.messageTypes.length > 0) && (
            <Badge variant="secondary" className="ml-2">
              {filters.conversations.length + filters.messageTypes.length}
            </Badge>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedTab('history')}
        >
          <History className="h-4 w-4 mr-2" />
          History
        </Button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Search Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Conversations Filter */}
            <div className="space-y-2">
              <Label>Search in conversations</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {conversations.map((conv) => (
                  <div key={conv.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`conv-${conv.id}`}
                      checked={filters.conversations.includes(conv.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFilters((prev) => ({
                            ...prev,
                            conversations: [...prev.conversations, conv.id],
                          }));
                        } else {
                          setFilters((prev) => ({
                            ...prev,
                            conversations: prev.conversations.filter(
                              (id) => id !== conv.id,
                            ),
                          }));
                        }
                      }}
                    />
                    <Label htmlFor={`conv-${conv.id}`} className="text-sm">
                      {conv.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Message Types Filter */}
            <div className="space-y-2">
              <Label>Message types</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { type: 'text', label: 'Text', icon: FileText },
                  { type: 'image', label: 'Images', icon: Image },
                  { type: 'video', label: 'Videos', icon: Video },
                  { type: 'audio', label: 'Audio', icon: Music },
                  { type: 'file', label: 'Files', icon: File },
                ].map(({ type, label, icon: Icon }) => (
                  <Button
                    key={type}
                    variant={
                      filters.messageTypes.includes(type as any)
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() => {
                      if (filters.messageTypes.includes(type as any)) {
                        setFilters((prev) => ({
                          ...prev,
                          messageTypes: prev.messageTypes.filter(
                            (t) => t !== type,
                          ),
                        }));
                      } else {
                        setFilters((prev) => ({
                          ...prev,
                          messageTypes: [...prev.messageTypes, type as any],
                        }));
                      }
                    }}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sort by</Label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value: any) =>
                    setFilters((prev) => ({ ...prev, sortBy: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="sender">Sender</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Order</Label>
                <Select
                  value={filters.sortOrder}
                  onValueChange={(value: any) =>
                    setFilters((prev) => ({ ...prev, sortOrder: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Newest first</SelectItem>
                    <SelectItem value="asc">Oldest first</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
              <Button size="sm" onClick={handleSearch}>
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Results ({searchResults.length})</h3>
            <Button variant="outline" size="sm">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Sort
            </Button>
          </div>

          {searchResults.map((result) => (
            <Card
              key={result.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleSelectResult(result)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={result.senderAvatar} />
                    <AvatarFallback>
                      {result.senderName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-medium text-sm">{result.senderName}</p>
                      <Badge variant="outline" className="text-xs">
                        {getMessageTypeIcon(result.messageType)}
                        <span className="ml-1">{result.messageType}</span>
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(result.timestamp)}
                      </span>
                    </div>

                    <div
                      className="text-sm text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: result.snippet }}
                    />

                    {result.attachments && result.attachments.length > 0 && (
                      <div className="mt-2 flex items-center space-x-2">
                        <File className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {result.attachments[0].name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {searchQuery && searchResults.length === 0 && !isSearching && (
        <div className="text-center py-8">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            No messages found for "{searchQuery}"
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Try adjusting your search terms or filters
          </p>
        </div>
      )}
    </div>
  );

  const renderHistoryTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Search History</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSearchHistory([])}
        >
          Clear History
        </Button>
      </div>

      {searchHistory.length === 0 ? (
        <div className="text-center py-8">
          <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No search history</p>
        </div>
      ) : (
        <div className="space-y-2">
          {searchHistory.map((item) => (
            <Card
              key={item.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleSelectHistoryItem(item)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.query}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(item.timestamp)}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {item.resultCount} results
                      </span>
                    </div>
                  </div>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Search Messages</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {selectedTab === 'search' && renderSearchTab()}
          {selectedTab === 'history' && renderHistoryTab()}
        </div>

        {/* Tab Navigation */}
        <div className="border-t pt-4">
          <div className="flex space-x-2">
            <Button
              variant={selectedTab === 'search' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTab('search')}
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button
              variant={selectedTab === 'history' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTab('history')}
            >
              <History className="h-4 w-4 mr-2" />
              History
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
