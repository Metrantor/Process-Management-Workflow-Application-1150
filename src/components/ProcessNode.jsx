import React, { useState, useRef } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiMove, FiTrash2, FiEdit3, FiChevronDown, FiChevronUp, FiPlus, FiMinus, FiLink } = FiIcons;

const ProcessNode = ({ 
  process, 
  onMove, 
  onEdit, 
  onDelete, 
  onConnectionStart,
  onConnectionEnd,
  connectionMode,
  onUpdateDuration
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const nodeRef = useRef(null);

  const handleMouseDown = (e) => {
    // Don't start dragging if clicking on connection ports
    if (e.target.closest('.connection-port')) return;
    if (e.button !== 0) return;
    
    const rect = nodeRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const canvas = nodeRef.current.closest('[data-canvas]');
    const canvasRect = canvas.getBoundingClientRect();
    
    const newX = e.clientX - canvasRect.left - dragOffset.x;
    const newY = e.clientY - canvasRect.top - dragOffset.y;
    
    onMove(process.id, Math.max(0, newX), Math.max(0, newY));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const handleToggleCollapse = (e) => {
    e.stopPropagation();
    onEdit(process, { ...process, collapsed: !process.collapsed });
  };

  const handleConnectionPortClick = (e, portType) => {
    e.stopPropagation();
    if (connectionMode && connectionMode.availableTargets.includes(process.id)) {
      onConnectionEnd(process.id, portType);
    } else if (!connectionMode) {
      onConnectionStart(process.id, portType);
    }
  };

  const adjustDuration = (delta) => {
    const newDuration = Math.max(1, process.duration + delta);
    onUpdateDuration(process.id, newDuration);
  };

  const formatDate = (dayNumber) => {
    const startDate = new Date(2025, 0, 1);
    const date = new Date(startDate);
    date.setDate(date.getDate() + dayNumber);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const truncateText = (text, maxLength = 14) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const isCriticalPath = process.totalFloat === 0 && process.earlyStart > 0;
  const isConnectionSource = connectionMode?.sourceId === process.id;
  const isAvailableTarget = connectionMode?.availableTargets?.includes(process.id);
  const connectionActive = connectionMode !== null;

  return (
    <div
      ref={nodeRef}
      className={`absolute select-none cursor-move transition-all duration-200 ${
        isDragging ? 'z-30 scale-105' : 'z-20'
      } ${isConnectionSource ? 'ring-4 ring-blue-400 shadow-lg' : ''}`}
      style={{
        left: process.x,
        top: process.y,
        transform: isDragging ? 'scale(1.05)' : 'scale(1)',
        filter: 'drop-shadow(4px 4px 8px rgba(0, 0, 0, 0.15))'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className={`
        bg-gray-100 dark:bg-gray-600 rounded-lg border-2 min-w-[280px] overflow-hidden relative
        ${isCriticalPath ? 'border-red-500' : 'border-gray-400 dark:border-gray-500'}
        ${isAvailableTarget && connectionActive ? 'ring-4 ring-orange-400 shadow-orange-300/50' : ''}
        hover:shadow-xl transition-all duration-200
      `}>
        {/* Header with Connection Ports */}
        <div className="bg-[#074D92] text-white px-6 py-3 flex items-center justify-between relative">
          {/* Left Connection Port (Eingang) in Header */}
          <div 
            className={`connection-port absolute left-2 top-1/2 transform -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center cursor-pointer transition-all z-20 ${
              connectionActive && isAvailableTarget 
                ? 'bg-orange-400 hover:bg-orange-500 animate-pulse shadow-lg border-2 border-white' 
                : connectionActive
                ? 'bg-blue-400 hover:bg-blue-500 border-2 border-white'
                : 'bg-blue-400 hover:bg-blue-500 border-2 border-white'
            }`}
            onClick={(e) => handleConnectionPortClick(e, 'start')}
            title="Start Port (Eingang)"
          >
            <SafeIcon icon={FiLink} className="w-3 h-3 text-white" />
          </div>

          {/* Title and Move Icon */}
          <div className="flex items-center gap-3 flex-1 min-w-0 ml-6">
            <SafeIcon icon={FiMove} className="w-4 h-4 opacity-70 flex-shrink-0" />
            <span className="font-semibold text-sm truncate" title={process.name}>
              {truncateText(process.name, 14)}
            </span>
          </div>

          {/* Right Connection Port (Ausgang) in Header */}
          <div 
            className={`connection-port absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center cursor-pointer transition-all z-20 ${
              connectionActive && isAvailableTarget 
                ? 'bg-orange-400 hover:bg-orange-500 animate-pulse shadow-lg border-2 border-white' 
                : connectionActive
                ? 'bg-green-400 hover:bg-green-500 border-2 border-white'
                : 'bg-green-400 hover:bg-green-500 border-2 border-white'
            }`}
            onClick={(e) => handleConnectionPortClick(e, 'finish')}
            title="Finish Port (Ausgang)"
          >
            <SafeIcon icon={FiLink} className="w-3 h-3 text-white" />
          </div>

          {/* Collapse Button */}
          <div className="flex items-center gap-1 flex-shrink-0 mr-6">
            <button
              onClick={handleToggleCollapse}
              className="p-1 text-blue-200 hover:text-white hover:bg-blue-700 rounded"
              title={process.collapsed ? "Expand" : "Collapse"}
            >
              <SafeIcon icon={process.collapsed ? FiChevronDown : FiChevronUp} className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Process Info */}
        <div className="p-4 pb-8">
          <div className="text-center mb-3">
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              {formatDate(process.earlyStart)} - {formatDate(process.earlyFinish)}
            </div>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  adjustDuration(-1);
                }}
                className="w-6 h-6 bg-gray-300 hover:bg-gray-400 rounded-full flex items-center justify-center text-gray-700 transition-colors"
                title="Decrease Duration"
              >
                <SafeIcon icon={FiMinus} className="w-3 h-3" />
              </button>
              <div className="text-lg font-semibold text-gray-800 dark:text-gray-100 min-w-[3rem] text-center">
                {process.duration}d
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  adjustDuration(1);
                }}
                className="w-6 h-6 bg-gray-300 hover:bg-gray-400 rounded-full flex items-center justify-center text-gray-700 transition-colors"
                title="Increase Duration"
              >
                <SafeIcon icon={FiPlus} className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Control Buttons - Bottom Corners */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(process.id);
          }}
          className="absolute bottom-2 left-6 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-md"
          title="Delete"
        >
          <SafeIcon icon={FiTrash2} className="w-4 h-4" />
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(process, e);
          }}
          className="absolute bottom-2 right-6 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-md"
          title="Edit"
        >
          <SafeIcon icon={FiEdit3} className="w-4 h-4" />
        </button>

        {isCriticalPath && (
          <div className="bg-red-500 text-white text-xs font-medium text-center py-1">
            Critical Path
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessNode;