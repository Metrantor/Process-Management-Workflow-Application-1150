// Professional Network Planning - Critical Path Method (CPM) with Fixed Milestones
export const calculateNetworkPlan = (processes, connections) => {
  if (!processes.length) return processes;

  // Create adjacency lists for all connection types
  const successors = {};
  const predecessors = {};

  processes.forEach(p => {
    successors[p.id] = [];
    predecessors[p.id] = [];
  });

  connections.forEach(conn => {
    if (successors[conn.from] && predecessors[conn.to]) {
      const connectionType = `${conn.fromType || 'finish'}-${conn.toType || 'start'}`;
      successors[conn.from].push({
        id: conn.to,
        type: connectionType,
        delay: conn.delay || 0
      });
      predecessors[conn.to].push({
        id: conn.from,
        type: connectionType,
        delay: conn.delay || 0
      });
    }
  });

  // Create working copy
  const updatedProcesses = processes.map(p => ({ ...p }));
  const processMap = {};
  updatedProcesses.forEach(p => processMap[p.id] = p);

  // Helper function to convert fixed date to project day
  const getProjectDay = (fixedDate, projectStartDate = new Date(2025, 0, 1)) => {
    if (!fixedDate) return 0;
    const fixed = new Date(fixedDate);
    const start = new Date(projectStartDate);
    return Math.ceil((fixed - start) / (1000 * 60 * 60 * 24));
  };

  // Forward pass - Calculate early start and early finish
  const visited = new Set();
  const calculating = new Set();

  const calculateEarlyTimes = (processId) => {
    if (calculating.has(processId)) return; // Avoid cycles
    if (visited.has(processId)) return;

    calculating.add(processId);
    const process = processMap[processId];

    // Handle fixed milestones first - they are constraint points
    if (process.type === 'milestone' && process.isFixed && process.fixedDate) {
      process.earlyStart = getProjectDay(process.fixedDate);
      process.earlyFinish = process.earlyStart; // Milestones have duration 0
      calculating.delete(processId);
      visited.add(processId);
      return;
    }

    // Calculate early start based on predecessors and connection types
    let maxConstraintTime = 0;

    predecessors[processId].forEach(pred => {
      calculateEarlyTimes(pred.id);
      const predProcess = processMap[pred.id];
      let constraintTime = 0;

      // Apply CPM logic based on connection type
      switch (pred.type) {
        case 'finish-start': // FS: A finishes before B starts
          constraintTime = predProcess.earlyFinish + (pred.delay || 0);
          break;
        case 'start-start': // SS: A and B start together
          constraintTime = predProcess.earlyStart + (pred.delay || 0);
          break;
        case 'finish-finish': // FF: A and B finish together
          constraintTime = predProcess.earlyFinish - (process.duration || 0) + (pred.delay || 0);
          break;
        case 'start-finish': // SF: A starts before B finishes
          constraintTime = predProcess.earlyStart - (process.duration || 0) + (pred.delay || 0);
          break;
        default:
          constraintTime = predProcess.earlyFinish + (pred.delay || 0);
          break;
      }

      maxConstraintTime = Math.max(maxConstraintTime, constraintTime);
    });

    process.earlyStart = Math.max(0, maxConstraintTime);
    process.earlyFinish = process.earlyStart + (process.duration || 0);

    calculating.delete(processId);
    visited.add(processId);
  };

  // Calculate early times for all processes
  updatedProcesses.forEach(p => calculateEarlyTimes(p.id));

  // Find project end time - considering fixed milestones
  let projectEndTime = 0;
  updatedProcesses.forEach(p => {
    if (p.type === 'milestone' && p.isFixed && p.fixedDate) {
      // Fixed milestones can extend project duration
      projectEndTime = Math.max(projectEndTime, getProjectDay(p.fixedDate));
    } else {
      projectEndTime = Math.max(projectEndTime, p.earlyFinish);
    }
  });

  // Backward pass - Calculate late start and late finish
  const backwardVisited = new Set();
  const backwardCalculating = new Set();

  const calculateLateTimes = (processId) => {
    if (backwardCalculating.has(processId)) return;
    if (backwardVisited.has(processId)) return;

    backwardCalculating.add(processId);
    const process = processMap[processId];

    // Handle fixed milestones - they are fixed constraint points
    if (process.type === 'milestone' && process.isFixed && process.fixedDate) {
      process.lateFinish = getProjectDay(process.fixedDate);
      process.lateStart = process.lateFinish;
      backwardCalculating.delete(processId);
      backwardVisited.add(processId);
      return;
    }

    // If no successors, late finish = project end time or early finish (whichever is larger)
    if (successors[processId].length === 0) {
      process.lateFinish = Math.max(process.earlyFinish, projectEndTime);
    } else {
      // Calculate late finish based on successors and connection types
      let minConstraintTime = Infinity;

      successors[processId].forEach(succ => {
        calculateLateTimes(succ.id);
        const succProcess = processMap[succ.id];
        let constraintTime = 0;

        // Apply CPM logic based on connection type - backward calculation
        switch (succ.type) {
          case 'finish-start': // FS: This finishes before successor starts
            constraintTime = succProcess.lateStart - (succ.delay || 0);
            break;
          case 'start-start': // SS: This and successor start together
            constraintTime = succProcess.lateStart + (process.duration || 0) - (succ.delay || 0);
            break;
          case 'finish-finish': // FF: This and successor finish together
            constraintTime = succProcess.lateFinish - (succ.delay || 0);
            break;
          case 'start-finish': // SF: This starts before successor finishes
            constraintTime = succProcess.lateFinish + (process.duration || 0) - (succ.delay || 0);
            break;
          default:
            constraintTime = succProcess.lateStart - (succ.delay || 0);
            break;
        }

        minConstraintTime = Math.min(minConstraintTime, constraintTime);
      });

      process.lateFinish = minConstraintTime;
    }

    process.lateStart = process.lateFinish - (process.duration || 0);
    process.totalFloat = Math.max(0, process.lateStart - process.earlyStart);

    backwardCalculating.delete(processId);
    backwardVisited.add(processId);
  };

  // Calculate late times for all processes
  updatedProcesses.forEach(p => calculateLateTimes(p.id));

  // Calculate free float
  updatedProcesses.forEach(process => {
    let minSuccessorEarlyStart = Infinity;

    successors[process.id].forEach(succ => {
      const successor = processMap[succ.id];
      let constraintTime = 0;

      switch (succ.type) {
        case 'finish-start':
          constraintTime = successor.earlyStart;
          break;
        case 'start-start':
          constraintTime = successor.earlyStart + (process.duration || 0);
          break;
        case 'finish-finish':
          constraintTime = successor.earlyFinish;
          break;
        case 'start-finish':
          constraintTime = successor.earlyFinish + (process.duration || 0);
          break;
        default:
          constraintTime = successor.earlyStart;
          break;
      }

      minSuccessorEarlyStart = Math.min(minSuccessorEarlyStart, constraintTime);
    });

    if (minSuccessorEarlyStart === Infinity) {
      // No successors - free float equals total float
      process.freeFloat = process.totalFloat;
    } else {
      process.freeFloat = Math.max(0, minSuccessorEarlyStart - process.earlyFinish);
    }
  });

  return updatedProcesses;
};

export const findCriticalPath = (processes, connections) => {
  const criticalProcesses = processes.filter(p => p.totalFloat === 0 && p.earlyStart > 0);
  return criticalProcesses.map(p => p.id);
};

export const getProjectDuration = (processes) => {
  if (!processes.length) return 0;
  return Math.max(...processes.map(p => p.earlyFinish));
};

export const getConnectionTypes = () => {
  return [
    {
      value: 'finish-start',
      label: 'FS - Finish to Start (Normalfolge)',
      description: 'Task A must finish before Task B can start'
    },
    {
      value: 'start-start',
      label: 'SS - Start to Start (Anfangsfolge)',
      description: 'Tasks A and B must start at the same time'
    },
    {
      value: 'finish-finish',
      label: 'FF - Finish to Finish (Endfolge)',
      description: 'Tasks A and B must finish at the same time'
    },
    {
      value: 'start-finish',
      label: 'SF - Start to Finish (Sprungfolge)',
      description: 'Task A must start before Task B can finish'
    }
  ];
};