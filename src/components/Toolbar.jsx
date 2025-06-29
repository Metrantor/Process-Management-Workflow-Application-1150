import React from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useTheme } from '../contexts/ThemeContext';

const { FiPlus, FiGrid, FiMoon, FiSun, FiMagnet, FiStickyNote, FiTarget, FiZoomIn, FiZoomOut } = FiIcons;

const Toolbar = ({ 
  gridMode, 
  setGridMode, 
  magnetMode, 
  setMagnetMode, 
  onAddProcess, 
  onAddMilestone, 
  onAddNote, 
  projectName, 
  setProjectName,
  zoomLevel,
  onZoom
}) => {
  const { isDarkMode, toggleTheme } = useTheme();

  const gridOptions = [
    { value: 'lines', label: 'Lines', icon: '#' },
    { value: 'none', label: 'Off', icon: '○' }
  ];

  const magnetOptions = [
    { value: 'off', label: 'Off' },
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 px-6 py-4 transition-colors fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* Editable Project Title */}
          <div>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="text-2xl font-bold text-gray-900 dark:text-white bg-transparent border-none outline-none focus:bg-gray-50 dark:focus:bg-gray-700 px-2 py-1 rounded"
              placeholder="Project name"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400">Network Planning - Professional Project Management</p>
          </div>

          {/* Main Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onAddProcess}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-md"
            >
              <SafeIcon icon={FiPlus} className="w-4 h-4" />
              Task
            </button>

            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-md">
                <SafeIcon icon={FiTarget} className="w-4 h-4" />
                Milestone
              </button>
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <button
                  onClick={() => onAddMilestone(false)}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                >
                  Calculated
                </button>
                <button
                  onClick={() => onAddMilestone(true)}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg border-t border-gray-200 dark:border-gray-600"
                >
                  Fixed Date
                </button>
              </div>
            </div>

            <button
              onClick={onAddNote}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors shadow-md"
            >
              <SafeIcon icon={FiStickyNote} className="w-4 h-4" />
              Note
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          {/* Zoom Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onZoom(-0.1)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Zoom Out"
            >
              <SafeIcon icon={FiZoomOut} className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[3rem] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => onZoom(0.1)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Zoom In"
            >
              <SafeIcon icon={FiZoomIn} className="w-4 h-4" />
            </button>
          </div>

          {/* Grid Options */}
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiGrid} className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Grid:</span>
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {gridOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setGridMode(option.value)}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    gridMode === option.value
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                  title={option.label}
                >
                  {option.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Magnet Options */}
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiMagnet} className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Snap:</span>
            <select
              value={magnetMode}
              onChange={(e) => setMagnetMode(e.target.value)}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {magnetOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
          >
            <SafeIcon icon={isDarkMode ? FiSun : FiMoon} className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;