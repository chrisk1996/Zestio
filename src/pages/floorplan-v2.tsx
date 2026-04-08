import { useEffect, useState } from 'react';

export default function FloorPlanPage() {
  const [Editor, setEditor] = useState<any>(null);
  const [sceneData, setSceneData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[FloorPlan] Starting load...');
    
    Promise.all([
      import('@pascal-app/editor')
        .then((mod) => {
          console.log('[FloorPlan] Editor module loaded:', mod);
          return mod.Editor;
        })
        .catch((err) => {
          console.error('[FloorPlan] Failed to load Editor:', err);
          throw err;
        }),
      fetch('/demos/demo_simple.json')
        .then((res) => {
          console.log('[FloorPlan] Scene fetch status:', res.status);
          return res.json();
        })
        .then((data) => {
          console.log('[FloorPlan] Scene data loaded:', data);
          return data;
        })
        .catch((err) => {
          console.error('[FloorPlan] Failed to load scene:', err);
          throw err;
        }),
    ])
      .then(([editor, data]) => {
        console.log('[FloorPlan] All loaded successfully');
        setEditor(() => editor);
        setSceneData(data);
      })
      .catch((err) => {
        console.error('[FloorPlan] Load error:', err);
        setError(err.message || 'Failed to load');
      });
  }, []);

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!Editor || !sceneData) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading Floor Planner...</p>
        </div>
      </div>
    );
  }

  const onLoad = async () => sceneData;

  return (
    <div className="fixed inset-0 flex flex-col">
      <Editor
        layoutVersion="v2"
        projectId="floorplan-v2"
        sidebarTabs={[{ id: 'site', label: 'Scene', component: () => null }]}
        onLoad={onLoad}
      />
    </div>
  );
}
