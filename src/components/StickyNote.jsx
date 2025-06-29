import React, { useState, useRef } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiTrash2, FiEdit3 } = FiIcons;

const StickyNote = ({ note, onMove, onUpdate, onDelete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [text, setText] = useState(note.text);
  const noteRef = useRef(null);

  const colors = {
    yellow: { bg: 'bg-yellow-200', border: 'border-yellow-300', shadow: 'shadow-yellow-500/30' },
    blue: { bg: 'bg-blue-200', border: 'border-blue-300', shadow: 'shadow-blue-500/30' },
    green: { bg: 'bg-green-200', border: 'border-green-300', shadow: 'shadow-green-500/30' },
    pink: { bg: 'bg-pink-200', border: 'border-pink-300', shadow: 'shadow-pink-500/30' },
    orange: { bg: 'bg-orange-200', border: 'border-orange-300', shadow: 'shadow-orange-500/30' }
  };

  const currentColor = colors[note.color] || colors.yellow;

  const handleMouseDown = (e) => {
    if (e.button !== 0 || isEditing) return;
    
    const rect = noteRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const canvas = noteRef.current.closest('[data-canvas]') || noteRef.current.parentElement;
    const canvasRect = canvas.getBoundingClientRect();
    
    const newX = e.clientX - canvasRect.left - dragOffset.x;
    const newY = e.clientY - canvasRect.top - dragOffset.y;
    
    onMove(note.id, Math.max(0, newX), Math.max(0, newY));
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

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdate(note.id, { text });
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      setText(note.text);
      setIsEditing(false);
    }
  };

  const changeColor = (newColor) => {
    onUpdate(note.id, { color: newColor });
  };

  return (
    <div
      ref={noteRef}
      className={`absolute select-none transition-all duration-200 ${
        isDragging ? 'z-30 scale-105' : 'z-15'
      }`}
      style={{
        left: note.x,
        top: note.y,
        transform: isDragging ? 'scale(1.05) rotate(1deg)' : 'rotate(-1deg)',
        filter: 'drop-shadow(3px 3px 6px rgba(0, 0, 0, 0.25))'
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      <div className={`
        ${currentColor.bg} ${currentColor.border} ${currentColor.shadow}
        border-2 rounded-lg p-4 min-w-[160px] max-w-[200px] min-h-[120px] 
        cursor-move hover:shadow-lg transition-shadow
      `}>
        {/* Header */}
        <div className="flex items-center justify-between mb-2 opacity-80">
          <div className="flex space-x-1">
            {Object.keys(colors).map(colorKey => (
              <button
                key={colorKey}
                onClick={(e) => {
                  e.stopPropagation();
                  changeColor(colorKey);
                }}
                className={`w-3 h-3 rounded-full ${colors[colorKey].bg} border hover:scale-110 transition-transform ${
                  note.color === colorKey ? 'ring-2 ring-gray-600' : ''
                }`}
                title={colorKey}
              />
            ))}
          </div>
          <div className="flex space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="p-1 text-gray-600 hover:text-gray-800 rounded"
              title="Edit"
            >
              <SafeIcon icon={FiEdit3} className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(note.id);
              }}
              className="p-1 text-red-600 hover:text-red-800 rounded"
              title="Delete"
            >
              <SafeIcon icon={FiTrash2} className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="text-sm text-gray-800">
          {isEditing ? (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              className="w-full bg-transparent border-none outline-none resize-none font-handwriting"
              rows="4"
              placeholder="Enter note..."
              autoFocus
            />
          ) : (
            <div className="whitespace-pre-wrap break-words font-handwriting leading-relaxed">
              {note.text || 'Double-click to edit'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StickyNote;