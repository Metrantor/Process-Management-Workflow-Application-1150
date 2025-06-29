import React, { useState, useEffect, useRef } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiX, FiSave, FiChevronRight } = FiIcons;

const ProcessEditor = ({ process, position, onUpdate, onClose }) => {
  const [currentTab, setCurrentTab] = useState('basic');
  const [formData, setFormData] = useState({
    name: process.name,
    type: process.type,
    duration: process.duration,
    note: process.note || ''
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
    onUpdate(process.id, {
      ...formData,
      duration: Math.max(1, parseInt(formData.duration) || 1)
    });
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSave();
  };

  const processTypes = [
    'Standard',
    'Milestone',
    'Critical',
    'Buffer',
    'External'
  ];

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

  return (
    <div
      ref={editorRef}
      className="absolute z-50 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-6 min-w-[400px]"
      style={{
        left: Math.min(position.x, window.innerWidth - 420),
        top: Math.min(position.y, window.innerHeight - 500),
        filter: 'drop-shadow(8px 8px 16px rgba(0, 0, 0, 0.2))'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Edit Task</h3>
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
                placeholder="Task name"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {processTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Duration (days)
              </label>
              <input
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

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
            
            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <div className="text-gray-500 dark:text-gray-400 text-xs">Early Start</div>
                <div className="font-mono font-medium text-gray-800 dark:text-gray-200">
                  {formatDateWithWeekday(process.earlyStart)}
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <div className="text-gray-500 dark:text-gray-400 text-xs">Early Finish</div>
                <div className="font-mono font-medium text-gray-800 dark:text-gray-200">
                  {formatDateWithWeekday(process.earlyFinish)}
                </div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                <div className="text-gray-500 dark:text-gray-400 text-xs">Late Start</div>
                <div className="font-mono font-medium text-gray-800 dark:text-gray-200">
                  {formatDateWithWeekday(process.lateStart)}
                </div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                <div className="text-gray-500 dark:text-gray-400 text-xs">Late Finish</div>
                <div className="font-mono font-medium text-gray-800 dark:text-gray-200">
                  {formatDateWithWeekday(process.lateFinish)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center">
                <div className="text-gray-500 dark:text-gray-400 text-xs">Total Float</div>
                <span className={`font-medium ${process.totalFloat === 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {process.totalFloat} days
                </span>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg text-center">
                <div className="text-gray-500 dark:text-gray-400 text-xs">Free Float</div>
                <span className={`font-medium ${process.freeFloat === 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {process.freeFloat} days
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

export default ProcessEditor;