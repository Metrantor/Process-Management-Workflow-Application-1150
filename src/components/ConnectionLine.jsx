import React from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiX } = FiIcons;

const ConnectionLine = ({ from, to, connection, onDelete }) => {
  // Calculate connection points with proper offset OUTSIDE objects
  const getConnectionPoints = (fromProcess, toProcess, connectionType) => {
    const fromPort = connectionType?.fromType || 'finish';
    const toPort = connectionType?.toType || 'start';
    
    // Process dimensions
    const processWidth = 280;
    const milestoneSize = 48; // Half of 96px diamond
    const connectionOffset = 12; // Distance OUTSIDE object edge
    
    let fromX, fromY, toX, toY;
    
    // Calculate FROM point OUTSIDE object
    if (fromProcess.type === 'milestone') {
      const centerX = fromProcess.x + milestoneSize;
      const centerY = fromProcess.y + milestoneSize;
      
      if (fromPort === 'start') {
        fromX = centerX - milestoneSize - connectionOffset; // LEFT outside diamond
        fromY = centerY;
      } else { // finish
        fromX = centerX + milestoneSize + connectionOffset; // RIGHT outside diamond
        fromY = centerY;
      }
    } else {
      const centerY = fromProcess.y + 15; // Header center
      
      if (fromPort === 'start') {
        fromX = fromProcess.x - connectionOffset; // LEFT outside box
        fromY = centerY;
      } else { // finish
        fromX = fromProcess.x + processWidth + connectionOffset; // RIGHT outside box
        fromY = centerY;
      }
    }
    
    // Calculate TO point OUTSIDE object
    if (toProcess.type === 'milestone') {
      const centerX = toProcess.x + milestoneSize;
      const centerY = toProcess.y + milestoneSize;
      
      if (toPort === 'start') {
        toX = centerX - milestoneSize - connectionOffset; // LEFT outside diamond
        toY = centerY;
      } else { // finish
        toX = centerX + milestoneSize + connectionOffset; // RIGHT outside diamond
        toY = centerY;
      }
    } else {
      const centerY = toProcess.y + 15; // Header center
      
      if (toPort === 'start') {
        toX = toProcess.x - connectionOffset; // LEFT outside box
        toY = centerY;
      } else { // finish
        toX = toProcess.x + processWidth + connectionOffset; // RIGHT outside box
        toY = centerY;
      }
    }
    
    return { fromX, fromY, toX, toY };
  };

  const { fromX, fromY, toX, toY } = getConnectionPoints(from, to, connection);

  // Create appropriate curve based on connection direction
  const isReversed = toX < fromX;
  const distance = Math.abs(toX - fromX);
  const controlDistance = Math.min(distance * 0.4, 100);
  
  let controlX1, controlY1, controlX2, controlY2;
  
  if (isReversed) {
    const curveDirection = fromY < toY ? -50 : 50;
    controlX1 = fromX - controlDistance;
    controlY1 = fromY + curveDirection;
    controlX2 = toX + controlDistance;
    controlY2 = toY + curveDirection;
  } else {
    controlX1 = fromX + controlDistance;
    controlY1 = fromY;
    controlX2 = toX - controlDistance;
    controlY2 = toY;
  }

  const pathData = `M ${fromX} ${fromY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${toX} ${toY}`;
  const midX = (fromX + toX) / 2;
  const midY = (fromY + toY) / 2;

  // Calculate arrow direction
  const angle = Math.atan2(toY - fromY, toX - fromX);
  const arrowSize = 8;
  const arrowX1 = toX - arrowSize * Math.cos(angle - Math.PI / 6);
  const arrowY1 = toY - arrowSize * Math.sin(angle - Math.PI / 6);
  const arrowX2 = toX - arrowSize * Math.cos(angle + Math.PI / 6);
  const arrowY2 = toY - arrowSize * Math.sin(angle + Math.PI / 6);

  const isCritical = from.totalFloat === 0 && to.totalFloat === 0;

  const getConnectionInfo = () => {
    const fromPort = connection?.fromType || 'finish';
    const toPort = connection?.toType || 'start';
    const connectionKey = `${fromPort}-${toPort}`;
    
    switch (connectionKey) {
      case 'finish-start': 
        return { 
          label: 'FS - Finish to Start (Normalfolge)', 
          color: '#10b981',
          isDashed: false
        };
      case 'start-start': 
        return { 
          label: 'SS - Start to Start (Anfangsfolge)', 
          color: '#3b82f6',
          isDashed: false
        };
      case 'finish-finish': 
        return { 
          label: 'FF - Finish to Finish (Endfolge)', 
          color: '#8b5cf6',
          isDashed: true
        };
      case 'start-finish': 
        return { 
          label: 'SF - Start to Finish (Sprungfolge)', 
          color: '#ef4444',
          isDashed: true
        };
      default: 
        return { 
          label: 'FS - Finish to Start', 
          color: '#10b981',
          isDashed: false
        };
    }
  };

  const connectionInfo = getConnectionInfo();

  return (
    <g className="connection-line group">
      {/* Start circle OUTSIDE object */}
      <circle
        cx={fromX}
        cy={fromY}
        r="4"
        fill={isCritical ? "#dc2626" : connectionInfo.color}
        className="drop-shadow-sm"
      />
      
      {/* Main curved line */}
      <path
        d={pathData}
        stroke={isCritical ? "#dc2626" : connectionInfo.color}
        strokeWidth={isCritical ? "3" : "2"}
        strokeDasharray={connectionInfo.isDashed ? "8,4" : "none"}
        fill="none"
        className="hover:opacity-80 transition-opacity"
      />
      
      {/* Arrow head pointing to target */}
      <polygon
        points={`${toX},${toY} ${arrowX1},${arrowY1} ${arrowX2},${arrowY2}`}
        fill={isCritical ? "#dc2626" : connectionInfo.color}
        className="drop-shadow-sm"
      />
      
      {/* Hover line for easier selection */}
      <path
        d={pathData}
        stroke="transparent"
        strokeWidth="12"
        fill="none"
        className="pointer-events-auto cursor-pointer"
      />
      
      {/* Connection type label */}
      <foreignObject
        x={midX - 60}
        y={midY - 25}
        width="120"
        height="20"
        className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded text-center whitespace-nowrap">
          {connectionInfo.label}
        </div>
      </foreignObject>
      
      {/* Delete button */}
      <foreignObject
        x={midX - 12}
        y={midY - 12}
        width="24"
        height="24"
        className="pointer-events-auto"
      >
        <button
          onClick={onDelete}
          className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100 shadow-lg"
          title={`Delete ${connectionInfo.label} Connection`}
        >
          <SafeIcon icon={FiX} className="w-3 h-3" />
        </button>
      </foreignObject>
    </g>
  );
};

export default ConnectionLine;