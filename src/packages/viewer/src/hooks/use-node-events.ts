import {
  BuildingEvent, BuildingNode, CeilingEvent, CeilingNode, ColumnEvent, ColumnNode, DoorEvent, DoorNode, EventSuffix,
  emitter, FenceEvent, FenceNode, ItemEvent, ItemNode, LevelEvent, LevelNode, RoofEvent, RoofNode, RoofSegmentEvent, RoofSegmentNode, SiteEvent, SiteNode, SlabEvent, SlabNode, SpawnEvent, SpawnNode, StairEvent, StairNode, StairSegmentEvent, StairSegmentNode, WallEvent, WallNode, WindowEvent, WindowNode, ZoneEvent, ZoneNode,
} from '@pascal-app/core'
import type { ThreeEvent } from '@react-three/fiber'
import useViewer from '../store/use-viewer'

type NodeConfig = {
  site: { node: SiteNode; event: SiteEvent }
  item: { node: ItemNode; event: ItemEvent }
  wall: { node: WallNode; event: WallEvent }
  fence: { node: FenceNode; event: FenceEvent }
  building: { node: BuildingNode; event: BuildingEvent }
  level: { node: LevelNode; event: LevelEvent }
  zone: { node: ZoneNode; event: ZoneEvent }
  slab: { node: SlabNode; event: SlabEvent }
  spawn: { node: SpawnNode; event: SpawnEvent }
  ceiling: { node: CeilingNode; event: CeilingEvent }
  column: { node: ColumnNode; event: ColumnEvent }
  roof: { node: RoofNode; event: RoofEvent }
  'roof-segment': { node: RoofSegmentNode; event: RoofSegmentEvent }
  stair: { node: StairNode; event: StairEvent }
  'stair-segment': { node: StairSegmentNode; event: StairSegmentEvent }
  window: { node: WindowNode; event: WindowEvent }
  door: { node: DoorNode; event: DoorEvent }
}

type NodeType = keyof NodeConfig

export function useNodeEvents<T extends NodeType>(node: NodeConfig[T]['node'], type: T) {
  const emit = (suffix: EventSuffix, e: ThreeEvent<PointerEvent>) => {
    const eventKey = `${type}:${suffix}` as `${T}:${EventSuffix}`
    const localPoint = e.object.worldToLocal(e.point.clone())
    const payload = {
      node,
      position: [e.point.x, e.point.y, e.point.z],
      localPosition: [localPoint.x, localPoint.y, localPoint.z],
      normal: e.face ? [e.face.normal.x, e.face.normal.y, e.face.normal.z] : undefined,
      faceIndex: e.faceIndex ?? undefined,
      object: e.object,
      stopPropagation: () => e.stopPropagation(),
      nativeEvent: e,
    } as NodeConfig[T]['event']

    emitter.emit(eventKey, payload)
  }

  return {
    onPointerDown: (e: ThreeEvent<PointerEvent>) => {
      if (useViewer.getState().cameraDragging) return
      if (e.button !== 0) return
      emit('pointerdown', e)
    },
    onPointerUp: (e: ThreeEvent<PointerEvent>) => {
      if (useViewer.getState().cameraDragging) return
      if (e.button !== 0) return
      emit('pointerup', e)
      // Synthesize a click event on pointer up to be more forgiving than R3F's default onClick
      // which often fails if the mouse moves even 1 pixel.
      emit('click', e)
    },
    onClick: (e: ThreeEvent<PointerEvent>) => {
      // Disable default R3F click since we synthesize it on pointerup
      // This prevents double-clicks from firing twice.
    },
    onPointerEnter: (e: ThreeEvent<PointerEvent>) => {
      if (useViewer.getState().cameraDragging) return
      emit('enter', e)
    },
    onPointerLeave: (e: ThreeEvent<PointerEvent>) => {
      if (useViewer.getState().cameraDragging) return
      emit('leave', e)
    },
    onPointerMove: (e: ThreeEvent<PointerEvent>) => {
      if (useViewer.getState().cameraDragging) return
      emit('move', e)
    },
    onDoubleClick: (e: ThreeEvent<PointerEvent>) => {
      if (useViewer.getState().cameraDragging) return
      emit('double-click', e)
    },
    onContextMenu: (e: ThreeEvent<PointerEvent>) => {
      if (useViewer.getState().cameraDragging) return
      emit('context-menu', e)
    },
  }
}
