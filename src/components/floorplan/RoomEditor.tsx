'use client';
import { useCallback, useState } from 'react';
import { Line, Group, Text } from 'react-konva';
import type { RoomPolygon } from './FloorPlanCanvas2D';

interface RoomEditorProps {
  rooms: RoomPolygon[];
  selectedRoomId: string | null;
  scale: number;
  onRoomSelect: (id: string) => void;
  onRoomUpdate: (room: RoomPolygon) => void;
}

const ROOM_COLORS: Record<string, string> = {
  living: 'rgba(129, 199, 132, 0.4)',
  kitchen: 'rgba(255, 183, 77, 0.4)',
  bedroom: 'rgba(100, 181, 246, 0.4)',
  bathroom: 'rgba(77, 208, 225, 0.4)',
  dining: 'rgba(240, 98, 146, 0.4)',
  office: 'rgba(186, 104, 200, 0.4)',
  garage: 'rgba(161, 136, 127, 0.4)',
  default: 'rgba(189, 189, 189, 0.4)',
};

const ROOM_BORDER_COLORS: Record<string, string> = {
  living: '#4caf50',
  kitchen: '#ff9800',
  bedroom: '#2196f3',
  bathroom: '#00bcd4',
  dining: '#e91e63',
  office: '#9c27b0',
  garage: '#795548',
  default: '#9e9e9e',
};

export default function RoomEditor({
  rooms,
  selectedRoomId,
  scale,
  onRoomSelect,
  onRoomUpdate,
}: RoomEditorProps) {
  const getCenter = (points: number[]): { x: number; y: number } => {
    let sumX = 0, sumY = 0;
    for (let i = 0; i < points.length; i += 2) {
      sumX += points[i];
      sumY += points[i + 1];
    }
    return { x: sumX / (points.length / 2), y: sumY / (points.length / 2) };
  };

  return (
    <>
      {rooms.map((room) => {
        const isSelected = room.id === selectedRoomId;
        const fillColor = ROOM_COLORS[room.type] || ROOM_COLORS.default;
        const strokeColor = isSelected ? '#3b82f6' : (ROOM_BORDER_COLORS[room.type] || ROOM_BORDER_COLORS.default);
        
        // Calculate center for label
        const center = getCenter(room.points);
        
        return (
          <Group key={room.id}>
            {/* Room polygon */}
            <Line
              points={room.points}
              closed
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={isSelected ? 3 / scale : 2 / scale}
              onClick={() => onRoomSelect(room.id)}
              onTap={() => onRoomSelect(room.id)}
            />
            
            {/* Room label */}
            <Text
              text={room.name}
              x={center.x}
              y={center.y}
              fontSize={14 / scale}
              fill="#374151"
              offsetX={room.name.length * 3 / scale}
              offsetY={7 / scale}
            />
            
            {/* Area label */}
            <Text
              text={`${Math.round(calculateArea(room.points) / 400)} m²`}
              x={center.x}
              y={center.y + 20 / scale}
              fontSize={10 / scale}
              fill="#6b7280"
              offsetX={`${Math.round(calculateArea(room.points) / 400)} m²`.length * 2.5 / scale}
            />
          </Group>
        );
      })}
    </>
  );
}

function calculateArea(points: number[]): number {
  if (points.length < 6) return 0;
  
  let area = 0;
  const n = points.length / 2;
  
  for (let i = 0; i < n; i++) {
    const x1 = points[i * 2];
    const y1 = points[i * 2 + 1];
    const x2 = points[((i + 1) % n) * 2];
    const y2 = points[((i + 1) % n) * 2 + 1];
    area += x1 * y2 - x2 * y1;
  }
  
  return Math.abs(area / 2);
}
