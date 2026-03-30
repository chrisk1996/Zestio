'use client';

import { useState, useCallback, useRef } from 'react';
import { useUndoRedo } from './useUndoRedo';

export interface PlacedFurniture2D {
  id: string;
  furnitureId: string;
  name: string;
  category: string;
  x: number;
  y: number;
  width: number;  // in pixels (scaled)
  height: number; // in pixels (scaled)
  rotation: number; // in degrees
  color: string;
}

export interface FurnitureDragItem {
  id: string;
  name: string;
  category: string;
  width: number;
  height: number;
  color: string;
}

// Scale factor: 1 meter = 20 pixels (matching GRID_SIZE from FloorPlanCanvas2D)
const SCALE_FACTOR = 20;

// Furniture library with dimensions in meters
export const FURNITURE_LIBRARY_2D: FurnitureDragItem[] = [
  // Living Room
  { id: 'sofa', name: 'Sofa', category: 'living', width: 2.0, height: 0.9, color: '#5d4037' },
  { id: 'sofa-small', name: 'Small Sofa', category: 'living', width: 1.5, height: 0.8, color: '#6d4c41' },
  { id: 'armchair', name: 'Armchair', category: 'living', width: 0.8, height: 0.8, color: '#795548' },
  { id: 'coffee-table', name: 'Coffee Table', category: 'living', width: 1.2, height: 0.6, color: '#8d6e63' },
  { id: 'tv-stand', name: 'TV Stand', category: 'living', width: 1.5, height: 0.4, color: '#37474f' },
  { id: 'bookshelf', name: 'Bookshelf', category: 'living', width: 1.0, height: 0.35, color: '#5d4037' },
  { id: 'side-table', name: 'Side Table', category: 'living', width: 0.5, height: 0.5, color: '#a1887f' },
  
  // Bedroom
  { id: 'bed-double', name: 'Double Bed', category: 'bedroom', width: 2.0, height: 1.8, color: '#7986cb' },
  { id: 'bed-single', name: 'Single Bed', category: 'bedroom', width: 1.0, height: 2.0, color: '#5c6bc0' },
  { id: 'wardrobe', name: 'Wardrobe', category: 'bedroom', width: 1.8, height: 0.6, color: '#5d4037' },
  { id: 'nightstand', name: 'Nightstand', category: 'bedroom', width: 0.5, height: 0.5, color: '#8d6e63' },
  { id: 'dresser', name: 'Dresser', category: 'bedroom', width: 1.2, height: 0.5, color: '#6d4c41' },
  
  // Kitchen
  { id: 'dining-table', name: 'Dining Table', category: 'kitchen', width: 1.8, height: 1.0, color: '#8d6e63' },
  { id: 'dining-table-small', name: 'Small Table', category: 'kitchen', width: 1.2, height: 0.8, color: '#a1887f' },
  { id: 'chair', name: 'Chair', category: 'kitchen', width: 0.45, height: 0.45, color: '#bcaaa4' },
  { id: 'counter', name: 'Counter', category: 'kitchen', width: 2.0, height: 0.6, color: '#e0e0e0' },
  { id: 'refrigerator', name: 'Refrigerator', category: 'kitchen', width: 0.7, height: 0.7, color: '#cfd8dc' },
  { id: 'stove', name: 'Stove', category: 'kitchen', width: 0.6, height: 0.6, color: '#424242' },
  
  // Bathroom
  { id: 'bathtub', name: 'Bathtub', category: 'bathroom', width: 1.7, height: 0.75, color: '#e0e0e0' },
  { id: 'shower', name: 'Shower', category: 'bathroom', width: 1.0, height: 1.0, color: '#b2ebf2' },
  { id: 'toilet', name: 'Toilet', category: 'bathroom', width: 0.5, height: 0.65, color: '#f5f5f5' },
  { id: 'sink', name: 'Sink', category: 'bathroom', width: 0.6, height: 0.5, color: '#f5f5f5' },
  { id: 'bathroom-cabinet', name: 'Cabinet', category: 'bathroom', width: 0.8, height: 0.4, color: '#d7ccc8' },
  
  // Office
  { id: 'desk', name: 'Desk', category: 'office', width: 1.5, height: 0.8, color: '#8d6e63' },
  { id: 'office-chair', name: 'Office Chair', category: 'office', width: 0.5, height: 0.5, color: '#37474f' },
  { id: 'filing-cabinet', name: 'Filing Cabinet', category: 'office', width: 0.4, height: 0.6, color: '#78909c' },
  { id: 'office-bookshelf', name: 'Bookshelf', category: 'office', width: 1.0, height: 0.35, color: '#5d4037' },
];

export function useFurniture(maxHistory: number = 50) {
  const {
    state: furniture,
    set: setFurniture,
    undo: undoFurniture,
    redo: redoFurniture,
    canUndo: canUndoFurniture,
    canRedo: canRedoFurniture,
    reset: resetFurniture,
  } = useUndoRedo<PlacedFurniture2D[]>([], maxHistory);

  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(null);
  const [draggingFrom, setDraggingFrom] = useState<FurnitureDragItem | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // Add new furniture
  const addFurniture = useCallback((item: FurnitureDragItem, x: number, y: number) => {
    const newPiece: PlacedFurniture2D = {
      id: `${item.id}-${Date.now()}`,
      furnitureId: item.id,
      name: item.name,
      category: item.category,
      x,
      y,
      width: item.width * SCALE_FACTOR,
      height: item.height * SCALE_FACTOR,
      rotation: 0,
      color: item.color,
    };
    setFurniture([...furniture, newPiece]);
    setSelectedFurnitureId(newPiece.id);
    return newPiece.id;
  }, [furniture, setFurniture]);

  // Update furniture position/properties
  const updateFurniture = useCallback((id: string, updates: Partial<PlacedFurniture2D>) => {
    setFurniture(furniture.map(f => 
      f.id === id ? { ...f, ...updates } : f
    ));
  }, [furniture, setFurniture]);

  // Rotate furniture (90 degrees)
  const rotateFurniture = useCallback((id: string) => {
    setFurniture(furniture.map(f => 
      f.id === id 
        ? { ...f, rotation: (f.rotation + 90) % 360 }
        : f
    ));
  }, [furniture, setFurniture]);

  // Delete furniture
  const deleteFurniture = useCallback((id: string) => {
    setFurniture(furniture.filter(f => f.id !== id));
    if (selectedFurnitureId === id) {
      setSelectedFurnitureId(null);
    }
  }, [furniture, setFurniture, selectedFurnitureId]);

  // Clear all furniture
  const clearAllFurniture = useCallback(() => {
    resetFurniture([]);
    setSelectedFurnitureId(null);
  }, [resetFurniture]);

  // Get selected furniture
  const getSelectedFurniture = useCallback(() => {
    return furniture.find(f => f.id === selectedFurnitureId) || null;
  }, [furniture, selectedFurnitureId]);

  // Snap to grid
  const snapToGrid = useCallback((value: number, gridSize: number = 20): number => {
    return Math.round(value / gridSize) * gridSize;
  }, []);

  // Snap to walls (simplified - snap to nearest wall edge)
  const snapToWalls = useCallback((
    x: number, 
    y: number, 
    walls: Array<{ x1: number; y1: number; x2: number; y2: number }>,
    snapThreshold: number = 15
  ): { x: number; y: number; snapped: boolean } => {
    for (const wall of walls) {
      // Check distance to wall line
      const dx = wall.x2 - wall.x1;
      const dy = wall.y2 - wall.y1;
      const length = Math.sqrt(dx * dx + dy * dy);
      
      if (length === 0) continue;
      
      // Project point onto wall line
      const t = Math.max(0, Math.min(1, 
        ((x - wall.x1) * dx + (y - wall.y1) * dy) / (length * length)
      ));
      
      const projX = wall.x1 + t * dx;
      const projY = wall.y1 + t * dy;
      
      const dist = Math.sqrt(Math.pow(x - projX, 2) + Math.pow(y - projY, 2));
      
      if (dist < snapThreshold) {
        return { x: projX, y: projY, snapped: true };
      }
    }
    
    return { x, y, snapped: false };
  }, []);

  // Snap to other furniture
  const snapToFurniture = useCallback((
    x: number,
    y: number,
    currentId: string,
    snapThreshold: number = 10
  ): { x: number; y: number; snapped: boolean } => {
    for (const piece of furniture) {
      if (piece.id === currentId) continue;
      
      // Check edges of other furniture
      const edges = [
        { x: piece.x, y: piece.y }, // top-left
        { x: piece.x + piece.width, y: piece.y }, // top-right
        { x: piece.x, y: piece.y + piece.height }, // bottom-left
        { x: piece.x + piece.width, y: piece.y + piece.height }, // bottom-right
        { x: piece.x + piece.width / 2, y: piece.y }, // top-center
        { x: piece.x + piece.width / 2, y: piece.y + piece.height }, // bottom-center
        { x: piece.x, y: piece.y + piece.height / 2 }, // left-center
        { x: piece.x + piece.width, y: piece.y + piece.height / 2 }, // right-center
      ];
      
      for (const edge of edges) {
        const dist = Math.sqrt(Math.pow(x - edge.x, 2) + Math.pow(y - edge.y, 2));
        if (dist < snapThreshold) {
          return { x: edge.x, y: edge.y, snapped: true };
        }
      }
    }
    
    return { x, y, snapped: false };
  }, [furniture]);

  // Combined snap function
  const snapPosition = useCallback((
    x: number,
    y: number,
    currentId: string,
    walls: Array<{ x1: number; y1: number; x2: number; y2: number }>,
    gridSize: number = 20
  ): { x: number; y: number; snapped: 'grid' | 'wall' | 'furniture' | null } => {
    // First try wall snap
    const wallSnap = snapToWalls(x, y, walls);
    if (wallSnap.snapped) {
      return { ...wallSnap, snapped: 'wall' };
    }
    
    // Then try furniture snap
    const furnitureSnap = snapToFurniture(x, y, currentId);
    if (furnitureSnap.snapped) {
      return { ...furnitureSnap, snapped: 'furniture' };
    }
    
    // Finally snap to grid
    return { 
      x: snapToGrid(x, gridSize), 
      y: snapToGrid(y, gridSize),
      snapped: 'grid'
    };
  }, [snapToWalls, snapToFurniture, snapToGrid]);

  return {
    furniture,
    selectedFurnitureId,
    draggingFrom,
    dragOffsetRef,
    setSelectedFurnitureId,
    setDraggingFrom,
    addFurniture,
    updateFurniture,
    rotateFurniture,
    deleteFurniture,
    clearAllFurniture,
    getSelectedFurniture,
    snapToGrid,
    snapToWalls,
    snapToFurniture,
    snapPosition,
    undoFurniture,
    redoFurniture,
    canUndoFurniture,
    canRedoFurniture,
    resetFurniture,
  };
}

// Furniture icons for library
export const FURNITURE_ICONS: Record<string, string> = {
  'sofa': 'weekend',
  'sofa-small': 'weekend',
  'armchair': 'chair',
  'coffee-table': 'table_restaurant',
  'tv-stand': 'tv',
  'bookshelf': 'menu_book',
  'side-table': 'table_restaurant',
  'bed-double': 'bed',
  'bed-single': 'bed',
  'wardrobe': 'door_front',
  'nightstand': 'table_restaurant',
  'dresser': 'drawer',
  'dining-table': 'table_restaurant',
  'dining-table-small': 'table_restaurant',
  'chair': 'chair',
  'counter': 'square',
  'refrigerator': 'kitchen',
  'stove': 'outdoor_grill',
  'bathtub': 'bathtub',
  'shower': 'shower',
  'toilet': 'wc',
  'sink': 'sink',
  'bathroom-cabinet': 'drawer',
  'desk': 'desk',
  'office-chair': 'chair',
  'filing-cabinet': 'drawer',
  'office-bookshelf': 'menu_book',
};
