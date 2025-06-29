import React, { useState, useRef } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiMove, FiTrash2, FiEdit3, FiCalendar, FiLink, FiPlus, FiMinus } = FiIcons;

const MilestoneNode = ({ 
  milestone, 
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
    
    onMove(milestone.id, Math.max(0, newX), Math.max(0, newY));
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

  const handleMilestoneClick = (e, portType = 'milestone') => {
    e.stopPropagation();
    if (connectionMode && connectionMode.availableTargets.includes(milestone.id)) {
      onConnectionEnd(milestone.id, portType);
    } else if (!connectionMode) {
      onConnectionStart(milestone.id, portType);
    }
  };

  const adjustDuration = (delta) => {
    if (!milestone.isFixed) return; // Only for fixed milestones
    const currentDate = new Date(milestone.fixedDate);
    currentDate.setDate(currentDate.getDate() + delta);
    onUpdateDuration(milestone.id, currentDate.toISOString().split('T')[0]);
  };

  const formatDateWithWeekday = (dayNumber) => {
    const startDate = new Date(2025, 0, 1);
    const date = new Date(startDate);
    date.setDate(date.getDate() + dayNumber);
    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dateStr = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
    return `${weekday} ${dateStr}`;
  };

  const getDisplayDate = () => {
    if (milestone.isFixed && milestone.fixedDate) {
      const date = new Date(milestone.fixedDate);
      const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
      return `${weekday} ${dateStr}`;
    }
    return formatDateWithWeekday(milestone.earlyStart);
  };

  const isConnectionSource = connectionMode?.sourceId === milestone.id;
  const isAvailableTarget = connectionMode?.availableTargets?.includes(milestone.id);
  const connectionActive = connectionMode !== null;

  return (
    <div
      ref={nodeRef}
      className={`absolute select-none cursor-move transition-all duration-200 ${
        isDragging ? 'z-30 scale-105' : 'z-20'
      } ${isConnectionSource ? 'ring-4 ring-blue-400 shadow-lg' : ''}`}
      style={{
        left: milestone.x,
        top: milestone.y,
        transform: isDragging ? 'scale(1.05)' : 'scale(1)',
        filter: 'drop-shadow(4px 4px 8px rgba(0, 0, 0, 0.15))'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="relative">
        {/* Connection Ports OUTSIDE diamond, at text level */}
        {/* Left Connection Port (Eingang) - OUTSIDE left */}
        <div 
          className={`connection-port absolute w-5 h-5 rounded-full flex items-center justify-center cursor-pointer transition-all z-30 ${
            connectionActive && isAvailableTarget 
              ? 'bg-orange-400 hover:bg-orange-500 animate-pulse shadow-lg border-2 border-white' 
              : connectionActive
              ? 'bg-blue-400 hover:bg-blue-500 border-2 border-white'
              : 'bg-blue-400 hover:bg-blue-500 border-2 border-white'
          }`}
          style={{
            left: '-10px', // OUTSIDE diamond
            top: '48px', // At milestone name level
            transform: 'translateY(-50%)'
          }}
          onClick={(e) => handleMilestoneClick(e, 'start')}
          title="Start Port (Eingang)"
        >
          <SafeIcon icon={FiLink} className="w-3 h-3 text-white" />
        </div>
        
        {/* Right Connection Port (Ausgang) - OUTSIDE right */}
        <div 
          className={`connection-port absolute w-5 h-5 rounded-full flex items-center justify-center cursor-pointer transition-all z-30 ${
            connectionActive && isAvailableTarget 
              ? 'bg-orange-400 hover:bg-orange-500 animate-pulse shadow-lg border-2 border-white' 
              : connectionActive
              ? 'bg-green-400 hover:bg-green-500 border-2 border-white'
              : 'bg-green-400 hover:bg-green-500 border-2 border-white'
          }`}
          style={{
            right: '-10px', // OUTSIDE diamond
            top: '48px', // At milestone name level
            transform: 'translateY(-50%)'
          }}
          onClick={(e) => handleMilestoneClick(e, 'finish')}
          title="Finish Port (Ausgang)"
        >
          <SafeIcon icon={FiLink} className="w-3 h-3 text-white" />
        </div>

        {/* Diamond Shape */}
        <div 
          className={`
            w-24 h-24 bg-[#074D92] transform rotate-45 relative cursor-pointer
            ${milestone.isFixed ? 'border-4 border-white' : 'border-2 border-gray-400'}
            ${isAvailableTarget && connectionActive ? 'ring-4 ring-orange-400 shadow-orange-300/50 animate-pulse' : ''}
            hover:shadow-xl transition-all duration-200
          `}
          style={{
            filter: 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.2))'
          }}
          onClick={(e) => handleMilestoneClick(e, 'milestone')}
          title={connectionActive ? "Click to connect" : "Milestone"}
        >
          {/* Content Container (counter-rotated) */}
          <div className="absolute inset-2 -rotate-45 flex flex-col items-center justify-center text-white text-xs">
            <div className="flex items-center gap-1 mb-1">
              <SafeIcon icon={FiCalendar} className="w-3 h-3" />
              {milestone.isFixed && (
                <div className="w-1 h-1 bg-white rounded-full" title="Fixed Date" />
              )}
            </div>
            
            <div className="text-center leading-tight">
              <div className="font-semibold text-[10px] mb-1 truncate max-w-[60px]">
                {milestone.name}
              </div>
              <div className="text-[7px] font-mono leading-tight">
                {getDisplayDate()}
              </div>
            </div>
          </div>

          {/* Control Buttons (positioned outside diamond) */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 -rotate-45 flex space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(milestone, e);
              }}
              className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              title="Edit"
            >
              <SafeIcon icon={FiEdit3} className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(milestone.id);
              }}
              className="p-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              title="Delete"
            >
              <SafeIcon icon={FiTrash2} className="w-3 h-3" />
            </button>
          </div>

          {/* Plus/Minus controls for fixed milestones */}
          {milestone.isFixed && (
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 -rotate-45 flex space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  adjustDuration(-1);
                }}
                className="p-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                title="Move Date Back"
              >
                <SafeIcon icon={FiMinus} className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  adjustDuration(1);
                }}
                className="p-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                title="Move Date Forward"
              >
                <SafeIcon icon={FiPlus} className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MilestoneNode;