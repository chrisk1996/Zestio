'use client';

import { useState, useCallback } from 'react';
import { FURNITURE_LIBRARY_2D, FURNITURE_ICONS, type FurnitureDragItem } from './useFurniture';

interface FurnitureLibraryPanelProps {
  onSelectFurniture: (item: FurnitureDragItem | null) => void;
  selectedFurniture: FurnitureDragItem | null;
  compact?: boolean;
}

const CATEGORIES = [
  { id: 'living', name: 'Living Room', icon: 'weekend' },
  { id: 'bedroom', name: 'Bedroom', icon: 'bed' },
  { id: 'kitchen', name: 'Kitchen', icon: 'kitchen' },
  { id: 'bathroom', name: 'Bathroom', icon: 'bathtub' },
  { id: 'office', name: 'Office', icon: 'desk' },
];

export default function FurnitureLibraryPanel({
  onSelectFurniture,
  selectedFurniture,
  compact = false,
}: FurnitureLibraryPanelProps) {
  const [activeCategory, setActiveCategory] = useState('living');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter furniture by category and search
  const filteredItems = FURNITURE_LIBRARY_2D.filter(item => {
    const matchesCategory = item.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle drag start
  const handleDragStart = useCallback((item: FurnitureDragItem) => {
    onSelectFurniture(item);
  }, [onSelectFurniture]);

  // Compact mode - horizontal scrollable list
  if (compact) {
    return (
      <div className="flex gap-2 items-center overflow-x-auto pb-2 h-full">
        {FURNITURE_LIBRARY_2D.slice(0, 12).map((item) => {
          const icon = FURNITURE_ICONS[item.id] || 'chair';
          const isSelected = selectedFurniture?.id === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSelectFurniture(isSelected ? null : item)}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('application/json', JSON.stringify(item));
                handleDragStart(item);
              }}
              className={`flex-shrink-0 w-20 p-2 rounded-lg border-2 transition-all cursor-grab active:cursor-grabbing
                ${isSelected 
                  ? 'border-blue-600 bg-blue-50 shadow-md' 
                  : 'border-transparent bg-slate-100 hover:border-slate-300 hover:bg-slate-50'
                }`}
            >
              <div 
                className="w-12 h-12 mx-auto rounded-lg mb-1 flex items-center justify-center shadow-sm"
                style={{ backgroundColor: item.color }}
              >
                <span className="material-symbols-outlined text-white text-xl">{icon}</span>
              </div>
              <p className="text-xs font-medium text-center truncate text-slate-700">{item.name}</p>
              <p className="text-[10px] text-center text-slate-400">
                {item.width}m × {item.height}m
              </p>
            </button>
          );
        })}
        {FURNITURE_LIBRARY_2D.length > 12 && (
          <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center text-slate-400 text-xs">
            +{FURNITURE_LIBRARY_2D.length - 12} more
          </div>
        )}
      </div>
    );
  }

  // Full panel mode - sidebar
  return (
    <div className="w-64 bg-white border-l border-slate-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-slate-200">
        <h3 className="font-semibold text-slate-900 text-sm">Furniture Library</h3>
        <p className="text-xs text-slate-500 mt-0.5">Drag items to the canvas</p>
      </div>

      {/* Search */}
      <div className="p-2 border-b border-slate-200">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
            search
          </span>
          <input
            type="text"
            placeholder="Search furniture..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-slate-200">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors
              ${activeCategory === cat.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
          >
            <span className="material-symbols-outlined text-sm">{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Furniture grid */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-2 gap-2">
          {filteredItems.map(item => {
            const icon = FURNITURE_ICONS[item.id] || 'chair';
            const isSelected = selectedFurniture?.id === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onSelectFurniture(isSelected ? null : item)}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/json', JSON.stringify(item));
                  handleDragStart(item);
                }}
                className={`p-2 rounded-lg border-2 transition-all cursor-grab active:cursor-grabbing text-left
                  ${isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  }`}
              >
                <div 
                  className="w-10 h-10 rounded-lg mb-1.5 flex items-center justify-center shadow-sm mx-auto"
                  style={{ backgroundColor: item.color }}
                >
                  <span className="material-symbols-outlined text-white">{icon}</span>
                </div>
                <p className="text-xs font-medium text-center truncate">{item.name}</p>
                <p className="text-[10px] text-center text-slate-400 mt-0.5">
                  {item.width}m × {item.height}m
                </p>
              </button>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-sm">
            No furniture found
          </div>
        )}
      </div>

      {/* Selected item info */}
      {selectedFurniture && (
        <div className="p-3 bg-blue-50 border-t border-blue-200">
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded flex items-center justify-center"
              style={{ backgroundColor: selectedFurniture.color }}
            >
              <span className="material-symbols-outlined text-white text-sm">
                {FURNITURE_ICONS[selectedFurniture.id] || 'chair'}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">{selectedFurniture.name}</p>
              <p className="text-xs text-blue-700">
                {selectedFurniture.width}m × {selectedFurniture.height}m
              </p>
            </div>
            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
              Click to place
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Export for drag-and-drop
export { type FurnitureDragItem };
