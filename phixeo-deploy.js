#!/usr/bin/env node

/**
 * Phixeo One-Command Deployment
 * Optimized with golden ratio principles for maximum efficiency
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Golden ratio constant
const PHI = 1.618033988749895;

// ANSI color codes
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
console.log();
console.log(`${colors.yellow} ██████╗ ██╗  ██╗██╗██╗  ██╗███████╗ ██████╗  ${colors.reset}`);
console.log(`${colors.yellow} ██╔══██╗██║  ██║██║╚██╗██╔╝██╔════╝██╔═══██╗ ${colors.reset}`);
console.log(`${colors.yellow} ██████╔╝███████║██║ ╚███╔╝ █████╗  ██║   ██║ ${colors.reset}`);
console.log(`${colors.yellow} ██╔═══╝ ██╔══██║██║ ██╔██╗ ██╔══╝  ██║   ██║ ${colors.reset}`);
console.log(`${colors.yellow} ██║     ██║  ██║██║██╔╝ ██╗███████╗╚██████╔╝ ${colors.reset}`);
console.log(`${colors.yellow} ╚═╝     ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚══════╝ ╚═════╝  ${colors.reset}`);
console.log(`${colors.gray}     One-Command Deployment System v${PHI}     ${colors.reset}`);
console.log();

// Check if running on Replit
const isReplit = process.env.REPL_ID !== undefined;

if (isReplit) {
  console.log(`${colors.blue}Detected Replit environment${colors.reset}`);
  console.log(`${colors.yellow}Preparing for deployment...${colors.reset}\n`);
  
  // Use Replit's deployment system
  try {
    // Try to use our Replit integration first
    const suggestDeploy = require('./phixeo-replit-deploy.js');
    suggestDeploy().then((success) => {
      if (success) {
        console.log(`\n${colors.green}✓ Deployment initiated!${colors.reset}`);
      } else {
        // If the integration couldn't access Replit's suggest_deploy
        showManualDeployInstructions();
      }
    }).catch((error) => {
      console.log(`${colors.yellow}Deployment tool not directly available.${colors.reset}`);
      showManualDeployInstructions();
    });
  } catch (error) {
    // Fallback to manual instructions
    console.log(`${colors.red}Error loading deployment integration:${colors.reset}`, error.message);
    showManualDeployInstructions();
  }
} else {
  // Local deployment instructions
  console.log(`${colors.blue}Running local deployment...${colors.reset}`);
  
  // Check if bash script exists
  if (fs.existsSync('./deploy.sh')) {
    console.log(`${colors.yellow}Executing deployment script...${colors.reset}`);
    
    // Make it executable first
    try {
      fs.chmodSync('./deploy.sh', 0o755);
    } catch (error) {
      console.error(`${colors.red}Error making script executable:${colors.reset}`, error.message);
    }
    
    // Execute the deployment script
    const deployProcess = spawn('bash', ['./deploy.sh'], { 
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
  } else {
    console.log(`${colors.red}Error: deployment script not found${colors.reset}`);
    console.log(`${colors.yellow}Please ensure that deploy.sh exists in the current directory.${colors.reset}`);
  }
}

// Function to show manual deployment instructions
function showManualDeployInstructions() {
  console.log(`\n${colors.cyan}To deploy your Phixeo application on Replit:${colors.reset}`);
  console.log(`1. Click the ${colors.green}Run${colors.reset} button in the Replit UI`);
  console.log(`2. Or use the ${colors.green}Deploy${colors.reset} tab for a permanent deployment\n`);
  
  console.log(`${colors.yellow}Your application will be available at:${colors.reset}`);
  if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
    console.log(`https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co\n`);
  } else {
    console.log(`https://[your-repl-name].[your-username].repl.co\n`);
  }
}