'use client';
import type { WallSegment, RoomPolygon, DoorData, WindowData } from './FloorPlanCanvas2D';

interface PropertiesPanelProps {
  selectedId: string | null;
  selectedType: 'wall' | 'room' | 'door' | 'window' | null;
  wall?: WallSegment;
  room?: RoomPolygon;
  door?: DoorData;
  window?: WindowData;
  onWallUpdate?: (wall: WallSegment) => void;
  onRoomUpdate?: (room: RoomPolygon) => void;
  onDelete?: () => void;
}

const WALL_MATERIALS = [
  { id: 'brick', name: 'Brick', color: '#B45C3B' },
  { id: 'concrete', name: 'Concrete', color: '#9CA3AF' },
  { id: 'drywall', name: 'Drywall', color: '#F5F5F5' },
];

const ROOM_TYPES = [
  { id: 'living', name: 'Living Room', color: '#81c784' },
  { id: 'kitchen', name: 'Kitchen', color: '#ffb74d' },
  { id: 'bedroom', name: 'Bedroom', color: '#64b5f6' },
  { id: 'bathroom', name: 'Bathroom', color: '#4dd0e1' },
  { id: 'dining', name: 'Dining', color: '#f06292' },
  { id: 'office', name: 'Office', color: '#ba68c8' },
  { id: 'garage', name: 'Garage', color: '#a1887f' },
];

const FLOOR_MATERIALS = [
  { id: 'oak', name: 'Natural Oak', color: '#D4A574' },
  { id: 'grey', name: 'Polished Grey', color: '#9CA3AF' },
  { id: 'marble', name: 'Carrara Marble', color: '#F5F5F5' },
  { id: 'tile', name: 'Ceramic Tile', color: '#E0E0E0' },
];

export default function PropertiesPanel({
  selectedId,
  selectedType,
  wall,
  room,
  door,
  window,
  onWallUpdate,
  onRoomUpdate,
  onDelete,
}: PropertiesPanelProps) {
  if (!selectedId || !selectedType) {
    return (
      <div className="w-72 bg-white border-l border-slate-200 p-6">
        <div className="text-center text-slate-400 mt-12">
          <span className="material-symbols-outlined text-5xl mb-3 block">touch_app</span>
          <p className="text-sm">Select an element to view its properties</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 bg-white border-l border-slate-200 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 capitalize">{selectedType} Properties</h3>
        <button
          onClick={onDelete}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete"
        >
          <span className="material-symbols-outlined">delete</span>
        </button>
      </div>

      {/* Wall Properties */}
      {selectedType === 'wall' && wall && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Thickness (cm)</label>
            <input
              type="number"
              value={wall.thickness}
              onChange={(e) => onWallUpdate?.({ ...wall, thickness: parseInt(e.target.value) || 15 })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              min={5}
              max={50}
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Type</label>
            <select
              value={wall.type}
              onChange={(e) => onWallUpdate?.({ ...wall, type: e.target.value as 'exterior' | 'interior' })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="interior">Interior</option>
              <option value="exterior">Exterior</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Material</label>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              {WALL_MATERIALS.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          
          <div className="pt-2 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              Length: {Math.round(Math.sqrt(Math.pow(wall.x2 - wall.x1, 2) + Math.pow(wall.y2 - wall.y1, 2)) / 2)} cm
            </p>
          </div>
        </div>
      )}

      {/* Room Properties */}
      {selectedType === 'room' && room && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Name</label>
            <input
              type="text"
              value={room.name}
              onChange={(e) => onRoomUpdate?.({ ...room, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Type</label>
            <select
              value={room.type}
              onChange={(e) => onRoomUpdate?.({ ...room, type: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              {ROOM_TYPES.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Floor Material</label>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              {FLOOR_MATERIALS.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          
          <div className="pt-2 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              Area: {Math.round(calculatePolygonArea(room.points) / 400)} m²
            </p>
          </div>
        </div>
      )}

      {/* Door Properties */}
      {selectedType === 'door' && door && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Width (cm)</label>
            <input
              type="number"
              value={door.width}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              min={60}
              max={150}
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Rotation (°)</label>
            <input
              type="number"
              value={door.rotation}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              min={0}
              max={360}
            />
          </div>
        </div>
      )}

      {/* Window Properties */}
      {selectedType === 'window' && window && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Width (cm)</label>
            <input
              type="number"
              value={window.width}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              min={40}
              max={300}
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Rotation (°)</label>
            <input
              type="number"
              value={window.rotation}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              min={0}
              max={360}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Helper: Calculate polygon area using Shoelace formula
function calculatePolygonArea(points: number[]): number {
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
