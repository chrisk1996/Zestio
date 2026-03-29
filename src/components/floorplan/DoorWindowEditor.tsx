'use client';
import { useRef, useCallback } from 'react';
import { Rect, Group } from 'react-konva';

interface DoorWindowEditorProps {
  doors: any[];
  windows: any[];
  selectedId: string | null;
  scale: number;
  onDoorSelect: (id: string) => void;
  onWindowSelect: (id: string) => void;
  onDoorAdd: (x: number, y: number, wallId: string) => void;
  onWindowAdd: (x: number, y: number, wallId: string) => void;
}

const DOOR_TYPES = [
  { id: 'single', name: 'Single Door', width: 90, color: '#8b5cf6' },
  { id: 'double', name: 'Double Door', width: 180, color: '#7c3aed' },
  { id: 'sliding', name: 'Sliding Door', width: 200, color: '#6d28d9' },
];

const WINDOW_TYPES = [
  { id: 'single', name: 'Single Window', width: 100, color: '#06b6d4' },
  { id: 'double', name: 'Double Window', width: 200, color: '#0891b2' },
  { id: 'bay', name: 'Bay Window', width: 250, color: '#0e7490' },
];

export default function DoorWindowEditor({
  doors,
  windows,
  selectedId,
  scale,
  onDoorSelect,
  onWindowSelect,
  onDoorAdd,
  onWindowAdd,
}: DoorWindowEditorProps) {
  return (
    <>
      {/* Doors */}
      {doors.map((door) => (
        <Group key={door.id}>
          {/* Door frame */}
          <Rect
            x={door.x - door.width / 2}
            y={door.y - 5}
            width={door.width}
            height={10}
            fill={selectedId === door.id ? '#a78bfa' : '#8b5cf6'}
            stroke={selectedId === door.id ? '#3b82f6' : '#6d28d9'}
            strokeWidth={selectedId === door.id ? 2 / scale : 1 / scale}
            rotation={door.rotation || 0}
            offsetX={door.width / 2}
            offsetY={5}
            onClick={() => onDoorSelect(door.id)}
            onTap={() => onDoorSelect(door.id)}
          />
          
          {/* Door swing arc indicator */}
          <Rect
            x={door.x - door.width / 4}
            y={door.y}
            width={door.width / 2}
            height={30}
            fill="transparent"
            stroke="#8b5cf6"
            strokeWidth={1 / scale}
            dash={[4 / scale, 2 / scale]}
            rotation={door.rotation || 0}
          />
        </Group>
      ))}
      
      {/* Windows */}
      {windows.map((win) => (
        <Group key={win.id}>
          {/* Window frame */}
          <Rect
            x={win.x - win.width / 2}
            y={win.y - 3}
            width={win.width}
            height={6}
            fill={selectedId === win.id ? '#67e8f9' : '#06b6d4'}
            stroke={selectedId === win.id ? '#3b82f6' : '#0891b2'}
            strokeWidth={selectedId === win.id ? 2 / scale : 1 / scale}
            rotation={win.rotation || 0}
            offsetX={win.width / 2}
            offsetY={3}
            onClick={() => onWindowSelect(win.id)}
            onTap={() => onWindowSelect(win.id)}
          />
          
          {/* Window dividers */}
          {[0.33, 0.66].map((pos, i) => (
            <Rect
              key={i}
              x={win.x - win.width / 2 + win.width * pos}
              y={win.y - 3}
              width={2 / scale}
              height={6}
              fill="#0891b2"
              rotation={win.rotation || 0}
            />
          ))}
        </Group>
      ))}
    </>
  );
}

// Door/Window picker component for the properties panel
export function DoorWindowPicker({ onSelect }: { onSelect: (type: 'door' | 'window', id: string) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-semibold text-slate-600 mb-2 block">Doors</label>
        <div className="grid grid-cols-3 gap-2">
          {DOOR_TYPES.map(door => (
            <button
              key={door.id}
              onClick={() => onSelect('door', door.id)}
              className="p-2 bg-slate-50 rounded-lg text-xs font-medium hover:bg-purple-100 transition-colors"
              style={{ borderLeft: `4px solid ${door.color}` }}
            >
              {door.name}
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <label className="text-xs font-semibold text-slate-600 mb-2 block">Windows</label>
        <div className="grid grid-cols-3 gap-2">
          {WINDOW_TYPES.map(win => (
            <button
              key={win.id}
              onClick={() => onSelect('window', win.id)}
              className="p-2 bg-slate-50 rounded-lg text-xs font-medium hover:bg-cyan-100 transition-colors"
              style={{ borderLeft: `4px solid ${win.color}` }}
            >
              {win.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
