'use client';

import { useState, useCallback, useRef } from 'react';
import { Stage, Layer, Rect, Group, Text, Line } from 'react-konva';
import type { PlacedFurniture2D, FurnitureDragItem, FURNITURE_LIBRARY_2D } from './useFurniture';

interface FurnitureCanvas2DProps {
  furniture: PlacedFurniture2D[];
  selectedId: string | null;
  scale: number;
  position: { x: number; y: number };
  onFurnitureSelect: (id: string | null) => void;
  onFurnitureMove: (id: string, x: number, y: number) => void;
  onFurnitureRotate: (id: string) => void;
  onFurnitureDelete: (id: string) => void;
  onFurnitureDrop: (item: FurnitureDragItem, x: number, y: number) => void;
  snapPosition: (x: number, y: number, currentId: string, walls: any[]) => { x: number; y: number; snapped: string | null };
  walls: Array<{ x1: number; y1: number; x2: number; y2: number }>;
}

const HANDLE_SIZE = 8;
const ROTATION_HANDLE_OFFSET = 20;

export default function FurnitureCanvas2D({
  furniture,
  selectedId,
  scale,
  position,
  onFurnitureSelect,
  onFurnitureMove,
  onFurnitureRotate,
  onFurnitureDelete,
  onFurnitureDrop,
  snapPosition,
  walls,
}: FurnitureCanvas2DProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragPiece, setDragPiece] = useState<PlacedFurniture2D | null>(null);
  const stageRef = useRef<any>(null);

  // Get pointer position relative to canvas
  const getPointerPosition = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    const pos = stage.getPointerPosition();
    if (!pos) return { x: 0, y: 0 };
    return {
      x: (pos.x - position.x) / scale,
      y: (pos.y - position.y) / scale,
    };
  }, [scale, position]);

  // Handle click on furniture
  const handleClick = useCallback((id: string, e: any) => {
    e.cancelBubble = true;
    if (!isDragging) {
      onFurnitureSelect(id === selectedId ? null : id);
    }
  }, [isDragging, selectedId, onFurnitureSelect]);

  // Handle drag start
  const handleDragStart = useCallback((piece: PlacedFurniture2D, e: any) => {
    e.cancelBubble = true;
    setIsDragging(true);
    setDragPiece(piece);
    onFurnitureSelect(piece.id);
  }, [onFurnitureSelect]);

  // Handle drag move
  const handleDragMove = useCallback((id: string, e: any) => {
    const snapped = snapPosition(e.target.x(), e.target.y(), id, walls);
    e.target.x(snapped.x);
    e.target.y(snapped.y);
  }, [snapPosition, walls]);

  // Handle drag end
  const handleDragEnd = useCallback((id: string, e: any) => {
    setIsDragging(false);
    setDragPiece(null);
    const snapped = snapPosition(e.target.x(), e.target.y(), id, walls);
    onFurnitureMove(id, snapped.x, snapped.y);
  }, [snapPosition, walls, onFurnitureMove]);

  // Handle rotation handle drag
  const handleRotationDrag = useCallback((id: string, e: any) => {
    e.cancelBubble = true;
    // Rotation is handled by parent component
    onFurnitureRotate(id);
  }, [onFurnitureRotate]);

  // Render single furniture piece
  const renderFurniture = (piece: PlacedFurniture2D) => {
    const isSelected = piece.id === selectedId;
    const { x, y, width, height, rotation, color, name } = piece;
    
    // Calculate center for rotation
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    return (
      <Group
        key={piece.id}
        x={x}
        y={y}
        rotation={rotation}
        offsetX={0}
        offsetY={0}
        draggable
        onClick={(e) => handleClick(piece.id, e)}
        onTap={(e) => handleClick(piece.id, e)}
        onDragStart={(e) => handleDragStart(piece, e)}
        onDragMove={(e) => handleDragMove(piece.id, e)}
        onDragEnd={(e) => handleDragEnd(piece.id, e)}
      >
        {/* Main furniture rectangle */}
        <Rect
          width={width}
          height={height}
          fill={isSelected ? `${color}dd` : color}
          stroke={isSelected ? '#3b82f6' : '#333'}
          strokeWidth={isSelected ? 2 / scale : 1 / scale}
          cornerRadius={3 / scale}
          shadowColor="rgba(0,0,0,0.3)"
          shadowBlur={isSelected ? 10 : 5}
          shadowOffset={{ x: 2, y: 2 }}
        />
        
        {/* Furniture name label */}
        <Text
          text={name}
          x={0}
          y={height / 2 - 7}
          width={width}
          align="center"
          fontSize={10 / scale}
          fill="#fff"
          fontStyle="bold"
          shadowColor="rgba(0,0,0,0.5)"
          shadowBlur={2}
        />

        {/* Selection handles */}
        {isSelected && (
          <>
            {/* Corner resize handles */}
            <Rect x={-HANDLE_SIZE/2} y={-HANDLE_SIZE/2} width={HANDLE_SIZE} height={HANDLE_SIZE} fill="#3b82f6" cornerRadius={2} />
            <Rect x={width - HANDLE_SIZE/2} y={-HANDLE_SIZE/2} width={HANDLE_SIZE} height={HANDLE_SIZE} fill="#3b82f6" cornerRadius={2} />
            <Rect x={-HANDLE_SIZE/2} y={height - HANDLE_SIZE/2} width={HANDLE_SIZE} height={HANDLE_SIZE} fill="#3b82f6" cornerRadius={2} />
            <Rect x={width - HANDLE_SIZE/2} y={height - HANDLE_SIZE/2} width={HANDLE_SIZE} height={HANDLE_SIZE} fill="#3b82f6" cornerRadius={2} />
            
            {/* Rotation handle */}
            <Group
              x={width / 2}
              y={-ROTATION_HANDLE_OFFSET}
              onClick={(e) => handleRotationDrag(piece.id, e)}
              onTap={(e) => handleRotationDrag(piece.id, e)}
            >
              <Line points={[0, 0, 0, ROTATION_HANDLE_OFFSET - 10]} stroke="#8b5cf6" strokeWidth={2 / scale} />
              <Rect x={-6} y={-6} width={12} height={12} fill="#8b5cf6" cornerRadius={6} />
              <Text text="↻" x={-5} y={-5} fontSize={10} fill="#fff" />
            </Group>

            {/* Delete button */}
            <Group
              x={width + 5}
              y={-5}
              onClick={(e) => {
                e.cancelBubble = true;
                onFurnitureDelete(piece.id);
              }}
            >
              <Rect x={0} y={0} width={16} height={16} fill="#ef4444" cornerRadius={8} />
              <Text text="✕" x={4} y={2} fontSize={12} fill="#fff" />
            </Group>
          </>
        )}
      </Group>
    );
  };

  return (
    <Group>
      {furniture.map(renderFurniture)}
    </Group>
  );
}
