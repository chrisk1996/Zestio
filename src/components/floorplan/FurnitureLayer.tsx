'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Stage, Layer, Line, Rect, Text, Group, Transformer } from 'react-konva';
import type { WallSegment, RoomPolygon, DoorData, WindowData, Tool } from './FloorPlanCanvas2D';
import type { PlacedFurniture2D, FurnitureDragItem } from './useFurniture';

const GRID_SIZE = 20; // 20px = 10cm at 1:50 scale
const SNAP_THRESHOLD = 10;

const WALL_COLORS = {
  exterior: '#333333',
  interior: '#666666'
};

const ROOM_COLORS: Record<string, string> = {
  living: 'rgba(129, 199, 132, 0.3)',
  kitchen: 'rgba(255, 183, 77, 0.3)',
  bedroom: 'rgba(100, 181, 246, 0.3)',
  bathroom: 'rgba(77, 208, 225, 0.3)',
  dining: 'rgba(240, 98, 146, 0.3)',
  office: 'rgba(186, 104, 200, 0.3)',
  default: 'rgba(189, 189, 189, 0.3)',
};

interface FurnitureLayerProps {
  furniture: PlacedFurniture2D[];
  selectedFurnitureId: string | null;
  scale: number;
  onFurnitureSelect: (id: string | null) => void;
  onFurnitureMove: (id: string, x: number, y: number) => void;
  onFurnitureRotate: (id: string) => void;
  onFurnitureDelete: (id: string) => void;
  walls: WallSegment[];
  snapToGrid: (value: number) => number;
}

// Furniture layer component
function FurnitureLayer({
  furniture,
  selectedFurnitureId,
  scale,
  onFurnitureSelect,
  onFurnitureMove,
  onFurnitureRotate,
  onFurnitureDelete,
  walls,
  snapToGrid,
}: FurnitureLayerProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [rotationHandle, setRotationHandle] = useState(false);

  // Snap position to walls and grid
  const snapPosition = useCallback((x: number, y: number, piece: PlacedFurniture2D): { x: number; y: number } => {
    // First snap to grid
    const snappedX = snapToGrid(x);
    const snappedY = snapToGrid(y);
    
    // Then check wall snapping (within threshold)
    for (const wall of walls) {
      const dx = wall.x2 - wall.x1;
      const dy = wall.y2 - wall.y1;
      const length = Math.sqrt(dx * dx + dy * dy);
      if (length === 0) continue;
      
      const t = Math.max(0, Math.min(1, ((snappedX - wall.x1) * dx + (snappedY - wall.y1) * dy) / (length * length)));
      const projX = wall.x1 + t * dx;
      const projY = wall.y1 + t * dy;
      const dist = Math.sqrt(Math.pow(snappedX - projX, 2) + Math.pow(snappedY - projY, 2));
      
      if (dist < SNAP_THRESHOLD) {
        return { x: snapToGrid(projX), y: snapToGrid(projY) };
      }
    }
    
    return { x: snappedX, y: snappedY };
  }, [walls, snapToGrid]);

  return (
    <Group>
      {furniture.map((piece) => {
        const isSelected = piece.id === selectedFurnitureId;
        const isDragging = piece.id === draggingId;
        
        return (
          <Group
            key={piece.id}
            x={piece.x}
            y={piece.y}
            rotation={piece.rotation}
            offsetX={0}
            offsetY={0}
            draggable
            onClick={(e) => {
              e.cancelBubble = true;
              onFurnitureSelect(piece.id);
            }}
            onTap={(e) => {
              e.cancelBubble = true;
              onFurnitureSelect(piece.id);
            }}
            onDragStart={(e) => {
              e.cancelBubble = true;
              setDraggingId(piece.id);
              onFurnitureSelect(piece.id);
            }}
            onDragEnd={(e) => {
              setDraggingId(null);
              const snapped = snapPosition(e.target.x(), e.target.y(), piece);
              onFurnitureMove(piece.id, snapped.x, snapped.y);
            }}
          >
            {/* Main furniture rectangle */}
            <Rect
              width={piece.width}
              height={piece.height}
              fill={isSelected ? `${piece.color}dd` : piece.color}
              stroke={isSelected ? '#3b82f6' : '#333'}
              strokeWidth={isSelected ? 2 / scale : 1 / scale}
              cornerRadius={3 / scale}
              shadowColor="rgba(0,0,0,0.3)"
              shadowBlur={isSelected ? 10 : 5}
              shadowOffset={{ x: 2 / scale, y: 2 / scale }}
            />
            
            {/* Furniture label */}
            <Text
              text={piece.name}
              x={0}
              y={piece.height / 2 - 7 / scale}
              width={piece.width}
              align="center"
              fontSize={10 / scale}
              fill="#fff"
              fontStyle="bold"
              shadowColor="rgba(0,0,0,0.5)"
              shadowBlur={2 / scale}
            />

            {/* Selection handles */}
            {isSelected && (
              <>
                {/* Rotation handle */}
                <Group
                  x={piece.width / 2}
                  y={-20 / scale}
                  onClick={(e) => {
                    e.cancelBubble = true;
                    onFurnitureRotate(piece.id);
                  }}
                  onTap={(e) => {
                    e.cancelBubble = true;
                    onFurnitureRotate(piece.id);
                  }}
                >
                  <Line 
                    points={[0, 0, 0, 15 / scale]} 
                    stroke="#8b5cf6" 
                    strokeWidth={2 / scale} 
                  />
                  <Rect 
                    x={-6 / scale} 
                    y={-6 / scale} 
                    width={12 / scale} 
                    height={12 / scale} 
                    fill="#8b5cf6" 
                    cornerRadius={6 / scale} 
                  />
                  <Text 
                    text="↻" 
                    x={-5 / scale} 
                    y={-5 / scale} 
                    fontSize={10 / scale} 
                    fill="#fff" 
                  />
                </Group>

                {/* Delete button */}
                <Group
                  x={piece.width + 5 / scale}
                  y={0}
                  onClick={(e) => {
                    e.cancelBubble = true;
                    onFurnitureDelete(piece.id);
                  }}
                  onTap={(e) => {
                    e.cancelBubble = true;
                    onFurnitureDelete(piece.id);
                  }}
                >
                  <Rect 
                    x={0} 
                    y={0} 
                    width={16 / scale} 
                    height={16 / scale} 
                    fill="#ef4444" 
                    cornerRadius={8 / scale} 
                  />
                  <Text 
                    text="✕" 
                    x={4 / scale} 
                    y={2 / scale} 
                    fontSize={12 / scale} 
                    fill="#fff" 
                  />
                </Group>

                {/* Corner resize indicators */}
                <Rect x={-3 / scale} y={-3 / scale} width={6 / scale} height={6 / scale} fill="#3b82f6" cornerRadius={2 / scale} />
                <Rect x={piece.width - 3 / scale} y={-3 / scale} width={6 / scale} height={6 / scale} fill="#3b82f6" cornerRadius={2 / scale} />
                <Rect x={-3 / scale} y={piece.height - 3 / scale} width={6 / scale} height={6 / scale} fill="#3b82f6" cornerRadius={2 / scale} />
                <Rect x={piece.width - 3 / scale} y={piece.height - 3 / scale} width={6 / scale} height={6 / scale} fill="#3b82f6" cornerRadius={2 / scale} />
              </>
            )}
          </Group>
        );
      })}
    </Group>
  );
}

export default FurnitureLayer;
