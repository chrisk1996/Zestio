import { useEffect, useState } from 'react';

export default function FloorPlanPage() {
  const [Editor, setEditor] = useState<any>(null);
  const [sceneData, setSceneData] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      import('@pascal-app/editor').then((mod) => mod.Editor),
      fetch('/demos/demo_simple.json').then((res) => res.json()),
    ])
      .then(([editor, data]) => {
        setEditor(() => editor);
        setSceneData(data);
      })
      .catch(console.error);
  }, []);

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
