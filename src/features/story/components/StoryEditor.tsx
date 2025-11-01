'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  Type,
  Smile,
  Music,
  MapPin,
  Palette,
  Download,
  RotateCcw,
  Check,
  X,
  Plus,
  Minus,
} from 'lucide-react';

interface StoryEditorProps {
  mediaUrl: string;
  mediaType: 'image' | 'video';
  initialData?: any;
  onComplete: (editedData: any) => void;
  onError: (error: string) => void;
}

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  backgroundColor?: string;
  fontFamily: string;
  rotation: number;
}

interface Filter {
  id: string;
  name: string;
  cssFilter: string;
  preview: string;
}

const FILTERS: Filter[] = [
  { id: 'normal', name: 'Normal', cssFilter: 'none', preview: '🌟' },
  {
    id: 'vintage',
    name: 'Vintage',
    cssFilter: 'sepia(0.5) contrast(1.2) brightness(1.1)',
    preview: '📸',
  },
  {
    id: 'dramatic',
    name: 'Dramatic',
    cssFilter: 'contrast(1.5) brightness(0.9) saturate(1.3)',
    preview: '🎭',
  },
  {
    id: 'warm',
    name: 'Warm',
    cssFilter: 'hue-rotate(15deg) saturate(1.2) brightness(1.1)',
    preview: '🔥',
  },
  {
    id: 'cool',
    name: 'Cool',
    cssFilter: 'hue-rotate(-15deg) saturate(1.1) brightness(1.05)',
    preview: '❄️',
  },
  {
    id: 'bw',
    name: 'B&W',
    cssFilter: 'grayscale(1) contrast(1.2)',
    preview: '⚫',
  },
  {
    id: 'fade',
    name: 'Fade',
    cssFilter: 'contrast(0.8) brightness(1.2) saturate(0.8)',
    preview: '🌫️',
  },
];

const TEXT_COLORS = [
  '#FFFFFF',
  '#000000',
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
  '#98D8C8',
  '#F7DC6F',
];

const FONT_FAMILIES = [
  'Arial, sans-serif',
  'Georgia, serif',
  'Impact, sans-serif',
  'Comic Sans MS, cursive',
  'Trebuchet MS, sans-serif',
];

export const StoryEditor: React.FC<StoryEditorProps> = ({
  mediaUrl,
  mediaType,
  initialData,
  onComplete,
  onError,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<Filter>(FILTERS[0]);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [activeTab, setActiveTab] = useState<
    'filters' | 'text' | 'stickers' | 'music' | 'location'
  >('filters');
  const [isAddingText, setIsAddingText] = useState(false);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [newTextInput, setNewTextInput] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  const handleAddText = useCallback(() => {
    if (!newTextInput.trim()) return;

    const newText: TextOverlay = {
      id: `text-${Date.now()}`,
      text: newTextInput,
      x: 50, // Center position
      y: 50,
      fontSize: 24,
      color: TEXT_COLORS[0],
      fontFamily: FONT_FAMILIES[0],
      rotation: 0,
    };

    setTextOverlays((prev) => [...prev, newText]);
    setNewTextInput('');
    setIsAddingText(false);
  }, [newTextInput]);

  const handleDeleteText = (id: string) => {
    setTextOverlays((prev) => prev.filter((text) => text.id !== id));
    setEditingTextId(null);
  };

  const handleTextEdit = (id: string, updates: Partial<TextOverlay>) => {
    setTextOverlays((prev) =>
      prev.map((text) => (text.id === id ? { ...text, ...updates } : text)),
    );
  };

  const handleComplete = () => {
    const editedData = {
      filter: selectedFilter,
      textOverlays,
      // Add other editing data here (stickers, music, etc.)
    };
    onComplete(editedData);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Media Preview with Overlays */}
      <div className="relative flex-1 bg-black overflow-hidden">
        {mediaType === 'image' ? (
          <img
            src={mediaUrl}
            alt="Story preview"
            className="w-full h-full object-cover"
            style={{ filter: selectedFilter.cssFilter }}
          />
        ) : (
          <video
            src={mediaUrl}
            className="w-full h-full object-cover"
            style={{ filter: selectedFilter.cssFilter }}
            autoPlay
            muted
            loop
          />
        )}

        {/* Text Overlays */}
        {textOverlays.map((textOverlay) => (
          <div
            key={textOverlay.id}
            className="absolute cursor-move select-none"
            style={{
              left: `${textOverlay.x}%`,
              top: `${textOverlay.y}%`,
              transform: `translate(-50%, -50%) rotate(${textOverlay.rotation}deg)`,
              fontSize: `${textOverlay.fontSize}px`,
              color: textOverlay.color,
              backgroundColor: textOverlay.backgroundColor,
              fontFamily: textOverlay.fontFamily,
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              padding: textOverlay.backgroundColor ? '4px 8px' : '0',
              borderRadius: textOverlay.backgroundColor ? '4px' : '0',
            }}
            onClick={() => setEditingTextId(textOverlay.id)}
          >
            {textOverlay.text}
          </div>
        ))}

        {/* Editing Controls for Active Text */}
        {editingTextId && (
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={() => handleDeleteText(editingTextId)}
              className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={() => setEditingTextId(null)}
              className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Editor Tabs */}
      <div
        className="border-t"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-card)',
        }}
      >
        <div className="flex items-center justify-around p-2">
          {[
            { id: 'filters', icon: Palette, label: 'Filters' },
            { id: 'text', icon: Type, label: 'Text' },
            { id: 'stickers', icon: Smile, label: 'Stickers' },
            { id: 'music', icon: Music, label: 'Music' },
            { id: 'location', icon: MapPin, label: 'Location' },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                activeTab === id
                  ? 'text-blue-500'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Editor Content */}
      <div
        className="p-4 max-h-48 overflow-y-auto"
        style={{ backgroundColor: 'var(--color-background)' }}
      >
        {activeTab === 'filters' && (
          <div className="space-y-4">
            <h3
              className="font-medium"
              style={{ color: 'var(--color-foreground)' }}
            >
              Choose a filter
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 flex items-center justify-center text-2xl transition-all ${
                    selectedFilter.id === filter.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {filter.preview}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'text' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3
                className="font-medium"
                style={{ color: 'var(--color-foreground)' }}
              >
                Add text
              </h3>
              <button
                onClick={() => setIsAddingText(true)}
                className="flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-blue-500 text-white hover:bg-blue-600"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {isAddingText && (
              <div className="space-y-3">
                <input
                  ref={textInputRef}
                  type="text"
                  value={newTextInput}
                  onChange={(e) => setNewTextInput(e.target.value)}
                  placeholder="Type your text..."
                  className="w-full p-3 border rounded-lg"
                  style={{
                    borderColor: 'var(--color-border)',
                    backgroundColor: 'var(--color-input)',
                    color: 'var(--color-foreground)',
                  }}
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddText}
                    className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                  >
                    Add Text
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingText(false);
                      setNewTextInput('');
                    }}
                    className="px-4 py-2 rounded-lg border hover:bg-gray-50"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Text Overlays List */}
            {textOverlays.length > 0 && (
              <div className="space-y-2">
                <h4
                  className="text-sm font-medium opacity-60"
                  style={{ color: 'var(--color-foreground)' }}
                >
                  Text layers ({textOverlays.length})
                </h4>
                {textOverlays.map((text) => (
                  <div
                    key={text.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      editingTextId === text.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setEditingTextId(text.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="font-medium truncate"
                        style={{ color: text.color }}
                      >
                        {text.text}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteText(text.id);
                        }}
                        className="p-1 rounded text-red-500 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Text Editing Controls */}
            {editingTextId && (
              <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700">Edit Text</h4>

                {/* Color Picker */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Color
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {TEXT_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleTextEdit(editingTextId, { color })}
                        className="w-8 h-8 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Font Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Size
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const currentText = textOverlays.find(
                          (t) => t.id === editingTextId,
                        );
                        if (currentText && currentText.fontSize > 12) {
                          handleTextEdit(editingTextId, {
                            fontSize: currentText.fontSize - 2,
                          });
                        }
                      }}
                      className="p-1 rounded border"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-medium w-12 text-center">
                      {
                        textOverlays.find((t) => t.id === editingTextId)
                          ?.fontSize
                      }
                      px
                    </span>
                    <button
                      onClick={() => {
                        const currentText = textOverlays.find(
                          (t) => t.id === editingTextId,
                        );
                        if (currentText && currentText.fontSize < 48) {
                          handleTextEdit(editingTextId, {
                            fontSize: currentText.fontSize + 2,
                          });
                        }
                      }}
                      className="p-1 rounded border"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'stickers' && (
          <div className="text-center py-8">
            <Smile
              className="w-12 h-12 mx-auto mb-4 opacity-50"
              style={{ color: 'var(--color-foreground)' }}
            />
            <p
              className="text-sm opacity-60"
              style={{ color: 'var(--color-foreground)' }}
            >
              Stickers coming soon...
            </p>
          </div>
        )}

        {activeTab === 'music' && (
          <div className="text-center py-8">
            <Music
              className="w-12 h-12 mx-auto mb-4 opacity-50"
              style={{ color: 'var(--color-foreground)' }}
            />
            <p
              className="text-sm opacity-60"
              style={{ color: 'var(--color-foreground)' }}
            >
              Music integration coming soon...
            </p>
          </div>
        )}

        {activeTab === 'location' && (
          <div className="text-center py-8">
            <MapPin
              className="w-12 h-12 mx-auto mb-4 opacity-50"
              style={{ color: 'var(--color-foreground)' }}
            />
            <p
              className="text-sm opacity-60"
              style={{ color: 'var(--color-foreground)' }}
            >
              Location tagging coming soon...
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div
        className="flex items-center justify-between p-4 border-t"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-card)',
        }}
      >
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors hover:bg-gray-50"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>

        <button
          onClick={handleComplete}
          className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all hover:scale-105"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'white',
          }}
        >
          <Check className="w-4 h-4" />
          Continue
        </button>
      </div>
    </div>
  );
};
