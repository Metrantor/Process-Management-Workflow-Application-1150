import React, { useState, useRef, useCallback } from 'react';
import ProcessNode from './ProcessNode';
import MilestoneNode from './MilestoneNode';
import ConnectionLine from './ConnectionLine';
import ProcessEditor from './ProcessEditor';
import MilestoneEditor from './MilestoneEditor';
import StickyNote from './StickyNote';
import Toolbar from './Toolbar';
import { calculateNetworkPlan } from '../utils/networkCalculations';
import { getMagnetDistance } from '../utils/magnetUtils';

const ProcessCanvas = ({ 
  gridMode, 
  setGridMode, 
  magnetMode, 
  setMagnetMode, 
  projectName, 
  setProjectName,
  zoomLevel,
  setZoomLevel 
}) => {
  const [processes, setProcesses] = useState([]);
  const [connections, setConnections] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editorPosition, setEditorPosition] = useState({ x: 0, y: 0 });
  const [connectionMode, setConnectionMode] = useState(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const nextId = useRef(1);
  const nextNoteId = useRef(1);

  const addProcess = useCallback(() => {
    const newProcess = {
      id: nextId.current++,
      name: `Task ${processes.filter(p => p.type !== 'milestone').length + 1}`,
      type: 'process',
      processType: 'Standard',
      duration: 5,
      x: 200 + (processes.length % 4) * 300,
      y: 150 + Math.floor(processes.length / 4) * 250,
      earlyStart: 0,
      earlyFinish: 0,
      lateStart: 0,
      lateFinish: 0,
      totalFloat: 0,
      freeFloat: 0,
      note: '',
      collapsed: false
    };
    setProcesses(prev => calculateNetworkPlan([...prev, newProcess], connections));
  }, [processes, connections]);

  const addMilestone = useCallback((isFixed = false) => {
    const newMilestone = {
      id: nextId.current++,
      name: `Milestone ${processes.filter(p => p.type === 'milestone').length + 1}`,
      type: 'milestone',
      isFixed: isFixed,
      duration: 0,
      fixedDate: isFixed ? new Date().toISOString().split('T')[0] : null,
      x: 200 + (processes.length % 4) * 300,
      y: 150 + Math.floor(processes.length / 4) * 250,
      earlyStart: 0,
      earlyFinish: 0,
      lateStart: 0,
      lateFinish: 0,
      totalFloat: 0,
      freeFloat: 0,
      note: ''
    };
    setProcesses(prev => calculateNetworkPlan([...prev, newMilestone], connections));
  }, [processes, connections]);

  const addNote = useCallback(() => {
    const newNote = {
      id: nextNoteId.current++,
      text: `Note ${notes.length + 1}`,
      x: 300 + (notes.length % 3) * 200,
      y: 100 + Math.floor(notes.length / 3) * 150,
      color: 'yellow'
    };
    setNotes(prev => [...prev, newNote]);
  }, [notes.length]);

  const updateProcess = useCallback((id, updates) => {
    setProcesses(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, ...updates } : p);
      return calculateNetworkPlan(updated, connections);
    });
  }, [connections]);

  const updateDuration = useCallback((id, newDuration) => {
    setProcesses(prev => {
      const process = prev.find(p => p.id === id);
      if (process?.type === 'milestone' && process.isFixed) {
        // For fixed milestones, newDuration is actually a new date
        const updated = prev.map(p => p.id === id ? { ...p, fixedDate: newDuration } : p);
        return calculateNetworkPlan(updated, connections);
      } else {
        // For regular processes, it's duration
        const updated = prev.map(p => p.id === id ? { ...p, duration: newDuration } : p);
        return calculateNetworkPlan(updated, connections);
      }
    });
  }, [connections]);

  const applyMagnet = useCallback((x, y) => {
    const magnetDistance = getMagnetDistance(magnetMode);
    if (magnetDistance === 0) return { x, y };

    const gridSize = 20;
    const snapX = Math.round(x / gridSize) * gridSize;
    const snapY = Math.round(y / gridSize) * gridSize;

    if (Math.abs(x - snapX) <= magnetDistance && Math.abs(y - snapY) <= magnetDistance) {
      return { x: snapX, y: snapY };
    }

    return { x, y };
  }, [magnetMode]);

  const moveProcess = useCallback((id, x, y) => {
    const snapped = applyMagnet(x, y);
    setProcesses(prev => prev.map(p => 
      p.id === id ? { ...p, x: snapped.x, y: snapped.y } : p
    ));
  }, [applyMagnet]);

  const moveNote = useCallback((id, x, y) => {
    const snapped = applyMagnet(x, y);
    setNotes(prev => prev.map(n => 
      n.id === id ? { ...n, x: snapped.x, y: snapped.y } : n
    ));
  }, [applyMagnet]);

  const deleteProcess = useCallback((id) => {
    setProcesses(prev => {
      const filtered = prev.filter(p => p.id !== id);
      return calculateNetworkPlan(filtered, connections.filter(c => c.from !== id && c.to !== id));
    });
    setConnections(prev => prev.filter(c => c.from !== id && c.to !== id));
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
    if (connectionMode?.sourceId === id) {
      setConnectionMode(null);
    }
  }, [selectedItem, connections, connectionMode]);

  const deleteNote = useCallback((id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  }, []);

  const updateNote = useCallback((id, updates) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
  }, []);

  const handleProcessEdit = useCallback((process, event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    setEditorPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    });
    setSelectedItem(process);
  }, []);

  const getAvailableTargets = useCallback((sourceId) => {
    return processes
      .filter(p => p.id !== sourceId)
      .filter(p => !connections.some(c => c.from === sourceId && c.to === p.id))
      .map(p => p.id);
  }, [processes, connections]);

  const handleConnectionStart = useCallback((processId, portType) => {
    if (connectionMode?.sourceId === processId) {
      setConnectionMode(null);
    } else {
      const availableTargets = getAvailableTargets(processId);
      setConnectionMode({
        sourceId: processId,
        sourcePort: portType,
        availableTargets
      });
    }
  }, [connectionMode, getAvailableTargets]);

  const handleConnectionEnd = useCallback((targetId, targetPort) => {
    if (connectionMode && connectionMode.availableTargets.includes(targetId)) {
      const newConnection = {
        id: `${connectionMode.sourceId}-${targetId}-${Date.now()}`,
        from: connectionMode.sourceId,
        to: targetId,
        fromType: connectionMode.sourcePort,
        toType: targetPort
      };
      
      const updatedConnections = [...connections, newConnection];
      setConnections(updatedConnections);
      setProcesses(prev => calculateNetworkPlan(prev, updatedConnections));
      setConnectionMode(null);
    }
  }, [connectionMode, connections]);

  const deleteConnection = useCallback((connectionId) => {
    const updatedConnections = connections.filter(c => c.id !== connectionId);
    setConnections(updatedConnections);
    setProcesses(prev => calculateNetworkPlan(prev, updatedConnections));
  }, [connections]);

  const handleZoom = useCallback((delta) => {
    setZoomLevel(prev => Math.max(0.5, Math.min(2, prev + delta)));
  }, [setZoomLevel]);

  const handleWheel = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      handleZoom(delta);
    }
  }, [handleZoom]);

  const handleKeyDown = useCallback((e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      document.body.style.cursor = 'grab';
    }
    if (e.key === 'Escape') {
      setConnectionMode(null);
    }
  }, []);

  const handleKeyUp = useCallback((e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      document.body.style.cursor = 'default';
      setIsPanning(false);
    }
  }, []);

  const handleMouseDown = useCallback((e) => {
    if ((e.code === 'Space' || e.target === canvasRef.current) && !connectionMode) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      document.body.style.cursor = 'grabbing';
    }
  }, [panOffset, connectionMode]);

  const handleMouseMove = useCallback((e) => {
    if (isPanning) {
      const newPanOffset = {
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      };
      // Prevent toolbar overlay - limit upward panning
      newPanOffset.y = Math.max(newPanOffset.y, -100);
      setPanOffset(newPanOffset);
    }
  }, [isPanning, panStart]);

  const handleMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      document.body.style.cursor = 'default';
    }
  }, [isPanning]);

  const handleCanvasClick = useCallback((e) => {
    if (e.target === canvasRef.current && connectionMode) {
      setConnectionMode(null);
    }
  }, [connectionMode]);

  const getBackgroundStyle = () => {
    // Remove grid dots/lines - infinite canvas
    if (gridMode === 'lines') {
      const gridSize = 20;
      const scaledGridSize = gridSize * zoomLevel;
      const offsetX = (panOffset.x / zoomLevel) % gridSize;
      const offsetY = (panOffset.y / zoomLevel) % gridSize;
      
      return {
        backgroundImage: `
          linear-gradient(rgba(209, 213, 219, 0.3) 1px, transparent 1px),
          linear-gradient(90deg, rgba(209, 213, 219, 0.3) 1px, transparent 1px)
        `,
        backgroundSize: `${scaledGridSize}px ${scaledGridSize}px`,
        backgroundPosition: `${offsetX}px ${offsetY}px`
      };
    }
    return {};
  };

  // Event listeners
  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleKeyDown, handleKeyUp, handleMouseMove, handleMouseUp]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors">
      <Toolbar 
        onAddProcess={addProcess}
        onAddMilestone={addMilestone}
        onAddNote={addNote}
        gridMode={gridMode}
        setGridMode={setGridMode}
        magnetMode={magnetMode}
        setMagnetMode={setMagnetMode}
        projectName={projectName}
        setProjectName={setProjectName}
        zoomLevel={zoomLevel}
        onZoom={handleZoom}
      />
      
      <div 
        ref={canvasRef}
        className={`w-full h-full relative overflow-hidden dark:bg-gray-900 ${
          connectionMode ? 'cursor-crosshair' : 'cursor-default'
        }`}
        style={{
          ...getBackgroundStyle(),
          transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${Math.max(panOffset.y / zoomLevel, -80)}px)`,
          transformOrigin: 'top left',
          paddingTop: '80px',
          minWidth: '200vw', // Infinite canvas width
          minHeight: '200vh' // Infinite canvas height
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onClick={handleCanvasClick}
        data-canvas="true"
      >
        {/* Connection Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {connections.map(connection => {
            const fromProcess = processes.find(p => p.id === connection.from);
            const toProcess = processes.find(p => p.id === connection.to);
            
            if (!fromProcess || !toProcess) return null;
            
            return (
              <ConnectionLine
                key={connection.id}
                from={fromProcess}
                to={toProcess}
                connection={connection}
                onDelete={() => deleteConnection(connection.id)}
              />
            );
          })}
        </svg>

        {/* Sticky Notes */}
        {notes.map(note => (
          <StickyNote
            key={note.id}
            note={note}
            onMove={moveNote}
            onUpdate={updateNote}
            onDelete={deleteNote}
          />
        ))}

        {/* Process Nodes and Milestones */}
        {processes.map(process => (
          process.type === 'milestone' ? (
            <MilestoneNode
              key={process.id}
              milestone={process}
              onMove={moveProcess}
              onEdit={handleProcessEdit}
              onDelete={deleteProcess}
              onConnectionStart={handleConnectionStart}
              onConnectionEnd={handleConnectionEnd}
              connectionMode={connectionMode}
              onUpdateDuration={updateDuration}
            />
          ) : (
            <ProcessNode
              key={process.id}
              process={process}
              onMove={moveProcess}
              onEdit={handleProcessEdit}
              onDelete={deleteProcess}
              onConnectionStart={handleConnectionStart}
              onConnectionEnd={handleConnectionEnd}
              connectionMode={connectionMode}
              onUpdateDuration={updateDuration}
            />
          )
        ))}

        {/* Process/Milestone Editor */}
        {selectedItem && (
          selectedItem.type === 'milestone' ? (
            <MilestoneEditor
              milestone={selectedItem}
              position={editorPosition}
              onUpdate={updateProcess}
              onClose={() => setSelectedItem(null)}
            />
          ) : (
            <ProcessEditor
              process={selectedItem}
              position={editorPosition}
              onUpdate={updateProcess}
              onClose={() => setSelectedItem(null)}
            />
          )
        )}

        {/* Connection Mode Indicator */}
        {connectionMode && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-orange-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
            <div className="text-sm font-medium">
              Connection Mode: {connectionMode.sourcePort === 'start' ? 'Eingang' : 'Ausgang'} selected
            </div>
            <div className="text-xs opacity-90">
              Click on target connector to complete connection, or press ESC to cancel
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      {processes.length === 0 && notes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-gray-500 dark:text-gray-400 mt-20">
            <h3 className="text-xl font-semibold mb-2">Professional Network Planning (CPM)</h3>
            <p className="mb-4">Create comprehensive project schedules with fixed milestones and precedence relationships</p>
            <div className="text-sm space-y-1">
              <p>• <strong>Fixed Milestones:</strong> Create constraint points that affect project timing</p>
              <p>• <strong>Rechts → Links:</strong> FS - Finish to Start (Normalfolge)</p>
              <p>• <strong>Links → Links:</strong> SS - Start to Start (Anfangsfolge)</p>
              <p>• <strong>Rechts → Rechts:</strong> FF - Finish to Finish (Endfolge)</p>
              <p>• <strong>Links → Rechts:</strong> SF - Start to Finish (Sprungfolge)</p>
              <p>• <strong>Blue connectors:</strong> Eingänge (left ports)</p>
              <p>• <strong>Green connectors:</strong> Ausgänge (right ports)</p>
              <p>• Hold Space + drag to pan infinite canvas</p>
              <p>• Ctrl + Mouse wheel to zoom</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessCanvas;