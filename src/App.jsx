import React, { useState } from 'react';
import ProcessCanvas from './components/ProcessCanvas';
import { ThemeProvider } from './contexts/ThemeContext';
import './App.css';

function App() {
  const [gridMode, setGridMode] = useState('dots'); // 'dots', 'lines', 'none'
  const [magnetMode, setMagnetMode] = useState('medium'); // 'off', 'small', 'medium', 'large'
  const [projectName, setProjectName] = useState('Project Planning');
  const [zoomLevel, setZoomLevel] = useState(1);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <ProcessCanvas 
          gridMode={gridMode}
          setGridMode={setGridMode}
          magnetMode={magnetMode}
          setMagnetMode={setMagnetMode}
          projectName={projectName}
          setProjectName={setProjectName}
          zoomLevel={zoomLevel}
          setZoomLevel={setZoomLevel}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;