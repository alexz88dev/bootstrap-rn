#!/usr/bin/env node

/**
 * Progress Tracker for MyCar Portrait Implementation
 * Shows current status of all implementation phases
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
};

// Read TODO.md and parse progress
function parseProgress() {
  const todoPath = path.join(process.cwd(), 'TODO.md');
  
  if (!fs.existsSync(todoPath)) {
    console.error('TODO.md not found!');
    return null;
  }

  const content = fs.readFileSync(todoPath, 'utf8');
  const lines = content.split('\n');
  
  const phases = [];
  let currentPhase = null;
  let totalTasks = 0;
  let completedTasks = 0;

  for (const line of lines) {
    // Match phase headers (## Phase X: Title)
    const phaseMatch = line.match(/^## Phase (\d+): (.+?)(?:\s+⚡ CURRENT)?$/);
    if (phaseMatch) {
      if (currentPhase) {
        phases.push(currentPhase);
      }
      currentPhase = {
        number: phaseMatch[1],
        name: phaseMatch[2],
        isCurrent: line.includes('⚡ CURRENT'),
        tasks: [],
        completed: 0,
        total: 0,
      };
    }
    
    // Match tasks (- [ ] or - [x])
    const taskMatch = line.match(/^- \[([ x])\] (.+)$/);
    if (taskMatch && currentPhase) {
      const isCompleted = taskMatch[1] === 'x';
      currentPhase.tasks.push({
        name: taskMatch[2],
        completed: isCompleted,
      });
      currentPhase.total++;
      totalTasks++;
      if (isCompleted) {
        currentPhase.completed++;
        completedTasks++;
      }
    }
  }
  
  if (currentPhase) {
    phases.push(currentPhase);
  }

  return { phases, totalTasks, completedTasks };
}

// Display progress bar
function progressBar(completed, total, width = 30) {
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  const filled = Math.round((width * completed) / total);
  const empty = width - filled;
  
  let color = colors.red;
  if (percentage >= 75) color = colors.green;
  else if (percentage >= 50) color = colors.yellow;
  
  const bar = color + '█'.repeat(filled) + colors.dim + '░'.repeat(empty) + colors.reset;
  return `${bar} ${percentage.toFixed(1)}%`;
}

// Main display
function displayProgress() {
  console.clear();
  console.log(colors.blue + colors.bold + '\n🚗 MyCar Portrait - Implementation Progress\n' + colors.reset);
  
  const progress = parseProgress();
  
  if (!progress) {
    return;
  }

  const { phases, totalTasks, completedTasks } = progress;
  
  // Overall progress
  console.log(colors.bold + 'Overall Progress:' + colors.reset);
  console.log(progressBar(completedTasks, totalTasks, 40));
  console.log(`${completedTasks}/${totalTasks} tasks completed\n`);
  
  // Phase breakdown
  console.log(colors.bold + 'Phases:' + colors.reset);
  
  for (const phase of phases) {
    const phaseColor = phase.isCurrent ? colors.yellow : '';
    const currentIndicator = phase.isCurrent ? ' ⚡' : '';
    
    console.log(`\n${phaseColor}Phase ${phase.number}: ${phase.name}${currentIndicator}${colors.reset}`);
    console.log(progressBar(phase.completed, phase.total, 25) + ` (${phase.completed}/${phase.total})`);
    
    // Show first few incomplete tasks for current phase
    if (phase.isCurrent) {
      const incompleteTasks = phase.tasks.filter(t => !t.completed).slice(0, 3);
      if (incompleteTasks.length > 0) {
        console.log(colors.dim + '  Next tasks:' + colors.reset);
        for (const task of incompleteTasks) {
          console.log(colors.dim + `    • ${task.name}` + colors.reset);
        }
      }
    }
  }
  
  // Summary statistics
  console.log('\n' + colors.bold + 'Statistics:' + colors.reset);
  const estimatedDays = Math.ceil((totalTasks - completedTasks) * 0.5); // Rough estimate
  console.log(`  📊 Completion Rate: ${(completedTasks / totalTasks * 100).toFixed(1)}%`);
  console.log(`  ⏱️  Estimated Days Remaining: ~${estimatedDays} days`);
  console.log(`  📝 Tasks Remaining: ${totalTasks - completedTasks}`);
  
  // Key milestones
  console.log('\n' + colors.bold + 'Key Milestones:' + colors.reset);
  const milestones = [
    { name: 'Project Setup', phaseEnd: 1 },
    { name: 'Backend Ready', phaseEnd: 3 },
    { name: 'Core App Complete', phaseEnd: 5 },
    { name: 'Widget Functional', phaseEnd: 6 },
    { name: 'App Store Ready', phaseEnd: 9 },
  ];
  
  for (const milestone of milestones) {
    const relevantPhases = phases.filter(p => parseInt(p.number) <= milestone.phaseEnd);
    const milestoneTasks = relevantPhases.reduce((sum, p) => sum + p.total, 0);
    const milestoneCompleted = relevantPhases.reduce((sum, p) => sum + p.completed, 0);
    const isComplete = milestoneCompleted === milestoneTasks;
    
    const icon = isComplete ? '✅' : '⏳';
    const color = isComplete ? colors.green : colors.dim;
    console.log(`  ${icon} ${color}${milestone.name}${colors.reset}`);
  }
  
  // Next actions
  console.log('\n' + colors.bold + 'Recommended Next Actions:' + colors.reset);
  console.log('  1. Run: bun scripts/mycar/setup-supabase.js');
  console.log('  2. Install dependencies: bun add @supabase/supabase-js react-native-purchases');
  console.log('  3. Set up Supabase project at https://app.supabase.com');
  console.log('\n');
}

// Run the display
displayProgress();

// Watch mode
if (process.argv.includes('--watch')) {
  setInterval(displayProgress, 5000);
  console.log(colors.dim + 'Watching for changes... Press Ctrl+C to exit' + colors.reset);
}