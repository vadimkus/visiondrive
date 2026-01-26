# Bays Page Fixes - December 24, 2025

## Issues Fixed

### 1. ✅ Bays Disappearing When Toggling Satellite/Normal View

**Problem:** When switching between satellite and normal map views, all bay rectangles would disappear and only reappear after a page reload.

**Root Cause:** 
- Mapbox's `setStyle()` removes ALL sources and layers when switching map styles
- The code was checking `if (!map.getSource('bays'))` before adding, which would fail on subsequent toggles
- Sources needed to be completely removed and re-added after each style change

**Solution:**
1. **Force source removal and re-addition** in `ensureLayers()`:
   ```typescript
   // Always remove and re-add sources after style change
   try {
     if (map.getSource('bays')) map.removeSource('bays')
   } catch {}
   map.addSource('bays', { type: 'geojson', data: baysData as any })
   ```

2. **Added delay after style.load** to ensure map is fully ready:
   ```typescript
   const onStyleLoad = () => {
     setTimeout(() => {
       ensureLayers()
       bindMoveHandlersIfReady()
       bindDraftMoveIfReady()
     }, 100)
   }
   ```

3. **Improved style toggle check** to avoid unnecessary style changes:
   ```typescript
   if (currentStyle?.sprite?.includes(satellite ? 'satellite' : 'streets')) return
   ```

### 2. ✅ Cannot Select or Move Existing Bays

**Problem:** Clicking on existing bay rectangles didn't select them, and dragging didn't work.

**Root Cause:**
- Event handlers bound to layer IDs (like `'bays-edit-fill'`) were lost after style changes
- The binding logic had a `bound` flag that prevented re-binding after style switches
- No unbinding before re-binding, causing potential conflicts

**Solution:**
1. **Improved event handler rebinding** after style changes:
   ```typescript
   const bindMoveHandlersIfReady = () => {
     if (!map.getLayer('bays-edit-fill')) return
     // Unbind first to avoid duplicate handlers
     try {
       if (bound) map.off('mousedown', 'bays-edit-fill', onMoveDown)
     } catch {}
     bound = true
     map.on('mousedown', 'bays-edit-fill', onMoveDown)
   }
   ```

2. **Re-trigger binding after style loads**:
   ```typescript
   setTimeout(() => {
     ensureLayers()
     bindMoveHandlersIfReady()  // Re-bind handlers
     bindDraftMoveIfReady()     // Re-bind draft handlers
   }, 100)
   ```

3. **Enhanced data update logic** with retry:
   ```typescript
   // Immediate update
   updateData()
   
   // Also update after delay to handle style transitions
   const timer = setTimeout(updateData, 50)
   ```

## How It Works Now

### Map Style Switching Flow:
1. User clicks "Normal" or "Satellite" button
2. `useEffect` detects `satellite` state change
3. Checks if style actually needs to change (avoid redundant calls)
4. Calls `map.setStyle(newStyle)`
5. Mapbox fires `style.load` event
6. After 100ms delay (ensures map is ready):
   - `ensureLayers()` removes old sources/layers and adds fresh ones with current data
   - `bindMoveHandlersIfReady()` re-attaches mouse event handlers
   - `bindDraftMoveIfReady()` re-attaches draft event handlers
7. Bays remain visible and interactive ✅

### Bay Selection & Dragging Flow:
1. User clicks on a bay rectangle
2. `onMapClickSelectBay` queries rendered features at click point
3. Bay is selected (green outline appears)
4. User can drag the bay:
   - `onMapDownMaybeMoveBay` detects mousedown on bay
   - Sets `moving = true` and captures starting position
   - `onMoveDrag` updates position as mouse moves
   - `onMoveUp` finalizes the move
5. All handlers survive style changes ✅

## Testing Checklist

- [x] Toggle between Satellite and Normal view multiple times
- [x] Verify bays remain visible after each toggle
- [x] Click on existing bays to select them
- [x] Drag bays to move them
- [x] Use Edit Handles to resize/rotate
- [x] Create new bays with Draw Rectangle mode
- [x] Save changes to database
- [x] Refresh page and verify persistence

## Technical Details

### Key Changes:
1. Sources are now **always removed and re-added** after style changes (not conditionally)
2. Event handlers are **re-bound after style loads** with proper cleanup
3. Data updates have **retry logic** to handle style transition timing
4. **100ms delay** after `style.load` ensures Mapbox is fully ready
5. Cleanup logic **unbinds handlers** before rebinding to prevent duplicates

### Files Modified:
- `/Users/vadimkus/VisionDrive/app/portal/bays/BaysPageClient.tsx` (lines 355-752)

## Performance Impact

- Minimal: Only adds 100ms delay on style switches (user already sees visual transition)
- No impact on regular map interactions
- Event handlers properly cleaned up to prevent memory leaks

---

**Status:** ✅ All issues resolved and tested
**Date:** December 24, 2025


