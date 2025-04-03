#!/usr/bin/env node

/**
 * Phixeo Command Line Interface
 * Based on golden ratio principles for optimal execution
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Golden ratio constant for timing calculations
const PHI = 1.618033988749895;

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
};

// Display Phixeo banner
function displayBanner() {
  console.log();
  console.log(`${colors.yellow} ██████╗ ██╗  ██╗██╗██╗  ██╗███████╗ ██████╗  ${colors.reset}`);
  console.log(`${colors.yellow} ██╔══██╗██║  ██║██║╚██╗██╔╝██╔════╝██╔═══██╗ ${colors.reset}`);
  console.log(`${colors.yellow} ██████╔╝███████║██║ ╚███╔╝ █████╗  ██║   ██║ ${colors.reset}`);
  console.log(`${colors.yellow} ██╔═══╝ ██╔══██║██║ ██╔██╗ ██╔══╝  ██║   ██║ ${colors.reset}`);
  console.log(`${colors.yellow} ██║     ██║  ██║██║██╔╝ ██╗███████╗╚██████╔╝ ${colors.reset}`);
  console.log(`${colors.yellow} ╚═╝     ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚══════╝ ╚═════╝  ${colors.reset}`);
  console.log(`${colors.gray}     AI-Powered Operating System v${PHI}        ${colors.reset}`);
  console.log();
}

// Command handlers
const commands = {
  // Auto-deploy the Phixeo system
  deploy: async () => {
    console.log(`${colors.yellow}Initiating Phixeo deployment...${colors.reset}`);
    
    // Check if running on Replit
    const isReplit = process.env.REPL_ID !== undefined;
    
    if (isReplit) {
      console.log(`${colors.blue}Detected Replit environment${colors.reset}`);
      console.log(`${colors.gray}Preparing for deployment...${colors.reset}`);
      
      // Use Replit's deployment system
      console.log(`\n${colors.green}✓ Deployment prepared!${colors.reset}`);
      console.log(`${colors.yellow}Your application will be available at:${colors.reset}`);
      console.log(`https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co\n`);
      
      // Suggest using the deployment UI
      console.log(`${colors.yellow}To complete deployment:${colors.reset}`);
      console.log(`1. Click the "Run" button in the Replit UI`);
      console.log(`2. Or use the "Deploy" tab for permanent deployment\n`);
      
      // Suggest the deploy tool
      console.log(`${colors.green}You can also use Replit's deployment tool:${colors.reset}`);
      const suggestDeploy = require('./suggest-deploy');
      await suggestDeploy();
    } else {
      // Local deployment via bash script
      console.log(`${colors.blue}Running local deployment...${colors.reset}`);
      const deployProcess = spawn('bash', ['deploy.sh'], { 
        stdio: 'inherit',
        shell: true
      });
      
      deployProcess.on('close', (code) => {
        if (code === 0) {
          console.log(`\n${colors.green}✓ Phixeo deployed successfully!${colors.reset}`);
        } else {
          console.log(`\n${colors.red}✗ Deployment failed with code ${code}${colors.reset}`);
        }
      });
    }
  },
  
  // Start the Phixeo system
  start: () => {
    console.log(`${colors.yellow}Starting Phixeo OS...${colors.reset}`);
    
    // Start the application based on configuration
    const startProcess = spawn('npm', ['run', 'dev'], { 
      stdio: 'inherit',
      shell: true
    });
    
    startProcess.on('close', (code) => {
      if (code !== 0) {
        console.log(`\n${colors.red}✗ Phixeo exited with code ${code}${colors.reset}`);
      }
    });
  },
  
  // Display help information
  help: () => {
    console.log(`${colors.cyan}Phixeo Command Line Interface${colors.reset}\n`);
    console.log(`Available commands:`);
    console.log(`  ${colors.green}phixeo${colors.reset}                - Start the Phixeo OS interface`);
    console.log(`  ${colors.green}phixeo deploy${colors.reset}         - Deploy Phixeo to production`);
    console.log(`  ${colors.green}phixeo start${colors.reset}          - Start Phixeo in development mode`);
    console.log(`  ${colors.green}phixeo help${colors.reset}           - Display this help information`);
    console.log(`  ${colors.green}phixeo version${colors.reset}        - Display version information`);
    console.log();
  },
  
  // Display version information
  version: () => {
    // Use the golden ratio as version number
    console.log(`Phixeo OS v${PHI.toFixed(6)}`);
    console.log(`Phi-optimized for maximum efficiency`);
  }
};

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const command = args[0] || 'start'; // Default to 'start' if no command provided
  
  if (commands[command]) {
    commands[command]();
  } else {
    console.log(`${colors.red}Unknown command: ${command}${colors.reset}`);
    commands.help();
  }
}

// Main function
function main() {
  displayBanner();
  parseArgs();
}

// Execute main function
main();