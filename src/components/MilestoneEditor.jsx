import React, { useState, useEffect, useRef } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiX, FiSave, FiCalendar, FiChevronRight } = FiIcons;

const MilestoneEditor = ({ milestone, position, onUpdate, onClose }) => {
  const [currentTab, setCurrentTab] = useState('basic');
  const [formData, setFormData] = useState({
    name: milestone.name,
    isFixed: milestone.isFixed,
    fixedDate: milestone.fixedDate || new Date().toISOString().split('T')[0],
    note: milestone.note || ''
  });
  
  const editorRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (editorRef.current && !editorRef.current.contains(event.target)) {
        handleSave();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [formData]);

  const handleSave = () => {
    onUpdate(milestone.id, {
      ...formData,
      fixedDate: formData.isFixed ? formData.fixedDate : null
    });
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSave();
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

  return (
    <div
      ref={editorRef}
      className="absolute z-50 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-6 min-w-[400px]"
      style={{
        left: Math.min(position.x, window.innerWidth - 420),
        top: Math.min(position.y, window.innerHeight - 400),
        filter: 'drop-shadow(8px 8px 16px rgba(0, 0, 0, 0.2))'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          <SafeIcon icon={FiCalendar} className="w-5 h-5" />
          Edit Milestone
        </h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
        >
          <SafeIcon icon={FiX} className="w-5 h-5" />
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-600 mb-4">
        <button
          onClick={() => setCurrentTab('basic')}
          className={`px-4 py-2 text-sm font-medium ${
            currentTab === 'basic'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Basic Info
        </button>
        <button
          onClick={() => setCurrentTab('advanced')}
          className={`px-4 py-2 text-sm font-medium flex items-center gap-1 ${
            currentTab === 'advanced'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Network Analysis
          <SafeIcon icon={FiChevronRight} className="w-3 h-3" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {currentTab === 'basic' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Milestone name"
                autoFocus
              />
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isFixed}
                  onChange={(e) => setFormData(prev => ({ ...prev, isFixed: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Fixed date (not calculated)
                </span>
              </label>
            </div>

            {formData.isFixed && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.fixedDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, fixedDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="3"
                placeholder="Additional information..."
              />
            </div>
          </>
        )}

        {currentTab === 'advanced' && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Network Plan Times</h4>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <div className="text-gray-500 dark:text-gray-400 text-xs">
                  {formData.isFixed ? 'Fixed Date' : 'Calculated Date'}
                </div>
                <div className="font-mono font-medium text-gray-800 dark:text-gray-200">
                  {formData.isFixed && formData.fixedDate 
                    ? new Date(formData.fixedDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })
                    : formatDate(milestone.earlyStart)
                  }
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <div className="text-gray-500 dark:text-gray-400 text-xs">Total Float</div>
                <span className={`font-medium ${milestone.totalFloat === 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {milestone.totalFloat} days
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <SafeIcon icon={FiSave} className="w-4 h-4" />
            Save
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default MilestoneEditor;