'use client';
import { useRef, useCallback, useState, useEffect } from 'react';
import { Line, Circle, Group } from 'react-konva';
import type { WallSegment } from './FloorPlanCanvas2D';

interface WallEditorProps {
  walls: WallSegment[];
  selectedWallId: string | null;
  scale: number;
  onWallSelect: (id: string) => void;
  onWallUpdate: (wall: WallSegment) => void;
  onWallDelete: (id: string) => void;
  snapToGrid: (value: number) => number;
}

const HANDLE_RADIUS = 8;

export default function WallEditor({
  walls,
  selectedWallId,
  scale,
  onWallSelect,
  onWallUpdate,
  onWallDelete,
  snapToGrid,
}: WallEditorProps) {
  const [draggingHandle, setDraggingHandle] = useState<'start' | 'end' | null>(null);
  const selectedWall = walls.find(w => w.id === selectedWallId);

  const handleDragStart = (handle: 'start' | 'end') => {
    setDraggingHandle(handle);
  };

  const handleDragEnd = () => {
    setDraggingHandle(null);
  };

  const handleDragMove = useCallback((wallId: string, handle: 'start' | 'end', x: number, y: number) => {
    const wall = walls.find(w => w.id === wallId);
    if (!wall) return;

    const snappedX = snapToGrid(x);
    const snappedY = snapToGrid(y);

    if (handle === 'start') {
      onWallUpdate({ ...wall, x1: snappedX, y1: snappedY });
    } else {
      onWallUpdate({ ...wall, x2: snappedX, y2: snappedY });
    }
  }, [walls, snapToGrid, onWallUpdate]);

  return (
    <>
      {/* Walls */}
      {walls.map((wall) => {
        const isSelected = wall.id === selectedWallId;
        const stroke = isSelected ? '#3b82f6' : wall.type === 'exterior' ? '#333333' : '#666666';
        const strokeWidth = (wall.thickness || 15) / scale;

        return (
          <Group key={wall.id}>
            {/* Wall line */}
            <Line
              points={[wall.x1, wall.y1, wall.x2, wall.y2]}
              stroke={stroke}
              strokeWidth={strokeWidth}
              lineCap="square"
              onClick={() => onWallSelect(wall.id)}
              onTap={() => onWallSelect(wall.id)}
            />
            
            {/* Selection handles */}
            {isSelected && (
              <>
                {/* Start handle */}
                <Circle
                  x={wall.x1}
                  y={wall.y1}
                  radius={HANDLE_RADIUS / scale}
                  fill="#3b82f6"
                  stroke="white"
                  strokeWidth={2 / scale}
                  draggable
                  onDragStart={() => handleDragStart('start')}
                  onDragEnd={handleDragEnd}
                  onDragMove={(e) => {
                    handleDragMove(wall.id, 'start', e.target.x(), e.target.y());
                  }}
                />
                
                {/* End handle */}
                <Circle
                  x={wall.x2}
                  y={wall.y2}
                  radius={HANDLE_RADIUS / scale}
                  fill="#3b82f6"
                  stroke="white"
                  strokeWidth={2 / scale}
                  draggable
                  onDragStart={() => handleDragStart('end')}
                  onDragEnd={handleDragEnd}
                  onDragMove={(e) => {
                    handleDragMove(wall.id, 'end', e.target.x(), e.target.y());
                  }}
                />
                
                {/* Midpoint handle for adding doors/windows */}
                <Circle
                  x={(wall.x1 + wall.x2) / 2}
                  y={(wall.y1 + wall.y2) / 2}
                  radius={6 / scale}
                  fill="#8b5cf6"
                  stroke="white"
                  strokeWidth={2 / scale}
                />
              </>
            )}
          </Group>
        );
      })}
    </>
  );
}
