'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useFloorPlanStore, useFloorPlanUndo } from '@/store/floorplan/store';
import { FloorPlanCanvas2D } from './FloorPlanCanvas2D';
import { PropertiesPanel } from './PropertiesPanel';
import { ToolPalette } from './ToolPalette';
import { FurnitureLibraryCompact } from './FurnitureLibraryCompact';
import { FloorPlanScene3D } from './FloorPlanScene3D';
import { useState } from 'react';

export function FloorPlanEditor() {
  const { activeTool, viewMode, setTool, setViewMode, zoomIn, zoomOut } = useFloorPlanStore();
  const { undo, redo, canUndo, canRedo } = useFloorPlanUndo();
  const [showProperties, setShowProperties] = useState(false);

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      {/* Top Toolbar */}
      <div className="flex items-center gap-2 px-2 py-2 border-b border-slate-200 bg-white flex-wrap">
        {/* View Mode Tabs */}
        <div className="flex rounded-lg overflow-hidden border border-slate-200">
          <button
            onClick={() => setViewMode('2d')}
            className={`px-3 py-2 text-sm font-medium ${
              viewMode === '2d' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'
            }`}
          >
            2D
          </button>
          <button
            onClick={() => setViewMode('3d')}
            className={`px-3 py-2 text-sm font-medium border-l border-slate-200 ${
              viewMode === '3d' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'
            }`}
          >
            3D
          </button>
        </div>

        {/* Tools - Horizontal on mobile */}
        <div className="flex gap-1">
          <button
            onClick={() => setTool('select')}
            className={`p-2 rounded-lg ${activeTool === 'select' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}
            title="Select"
          >
            <span className="material-symbols-outlined text-lg">mouse</span>
          </button>
          <button
            onClick={() => setTool('wall')}
            className={`p-2 rounded-lg ${activeTool === 'wall' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}
            title="Wall"
          >
            <span className="material-symbols-outlined text-lg">square</span>
          </button>
          <button
            onClick={() => setTool('room')}
            className={`p-2 rounded-lg ${activeTool === 'room' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}
            title="Room"
          >
            <span className="material-symbols-outlined text-lg">crop_square</span>
          </button>
        </div>

        {/* Zoom */}
        <div className="flex gap-1">
          <button
            onClick={zoomIn}
            className="p-2 rounded-lg bg-slate-100 text-slate-600"
            title="Zoom In"
          >
            <span className="material-symbols-outlined text-lg">zoom_in</span>
          </button>
          <button
            onClick={zoomOut}
            className="p-2 rounded-lg bg-slate-100 text-slate-600"
            title="Zoom Out"
          >
            <span className="material-symbols-outlined text-lg">zoom_out</span>
          </button>
        </div>

        {/* Undo/Redo */}
        <div className="flex gap-1">
          <button
            onClick={() => undo()}
            disabled={!canUndo}
            className={`p-2 rounded-lg ${canUndo ? 'bg-slate-100 text-slate-600' : 'bg-slate-50 text-slate-300'}`}
            title="Undo"
          >
            <span className="material-symbols-outlined text-lg">undo</span>
          </button>
          <button
            onClick={() => redo()}
            disabled={!canRedo}
            className={`p-2 rounded-lg ${canRedo ? 'bg-slate-100 text-slate-600' : 'bg-slate-50 text-slate-300'}`}
            title="Redo"
          >
            <span className="material-symbols-outlined text-lg">redo</span>
          </button>
        </div>

        <div className="flex-1" />

        {/* Properties toggle (mobile) */}
        <button
          onClick={() => setShowProperties(!showProperties)}
          className="p-2 rounded-lg bg-slate-100 text-slate-600 md:hidden"
          title="Properties"
        >
          <span className="material-symbols-outlined text-lg">tune</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Canvas Area */}
        <div className="flex-1 relative">
          {/* 2D Canvas */}
          {(viewMode === '2d' || viewMode === 'split') && (
            <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} h-full`}>
              <FloorPlanCanvas2D />
            </div>
          )}

          {/* 3D Canvas */}
          {(viewMode === '3d' || viewMode === 'split') && (
            <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} h-full bg-slate-100`}>
              <Canvas shadows>
                <PerspectiveCamera makeDefault position={[10, 10, 10]} />
                <OrbitControls />
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
                <FloorPlanScene3D />
                <gridHelper args={[20, 20]} />
              </Canvas>
            </div>
          )}
        </div>

        {/* Properties Panel - Desktop sidebar / Mobile overlay */}
        <div className="hidden md:block">
          <PropertiesPanel />
        </div>

        {/* Mobile Properties Overlay */}
        {showProperties && (
          <div className="fixed inset-0 bg-black/50 z-50 md:hidden" onClick={() => setShowProperties(false)}>
            <div 
              className="absolute right-0 top-0 h-full w-72 bg-white shadow-xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-semibold">Properties</h3>
                <button onClick={() => setShowProperties(false)} className="p-1">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <PropertiesPanel />
            </div>
          </div>
        )}
      </div>

      {/* Bottom: Furniture Library */}
      <div className="h-28 border-t border-slate-200 bg-white p-2 overflow-x-auto">
        <FurnitureLibraryCompact />
      </div>
    </div>
  );
}
