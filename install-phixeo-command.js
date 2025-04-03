/**
 * Script to install the Phixeo command globally
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

console.log(`${colors.yellow}Installing Phixeo command globally...${colors.reset}`);

try {
  // Make phixeo-cli.js executable
  execSync('chmod +x ./phixeo-cli.js');
  console.log(`${colors.green}✓ Made phixeo-cli.js executable${colors.reset}`);

  // Create a bin entry in package.json if it doesn't exist
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = require(packageJsonPath);
  
  if (!packageJson.bin) {
    packageJson.bin = {};
  }
  
  packageJson.bin.phixeo = './phixeo-cli.js';
  
  // Write the updated package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log(`${colors.green}✓ Updated package.json with bin entry${colors.reset}`);

  // Create a suggest-deploy.js module
  const suggestDeployPath = path.join(process.cwd(), 'suggest-deploy.js');
  fs.writeFileSync(suggestDeployPath, `
// Simple module to suggest using Replit's deploy feature
module.exports = async function() {
  // This will be replaced with the actual suggest_deploy function call
  console.log('Preparing deployment for Replit...');
  // This is a placeholder - the actual deployment happens through Replit's UI
  return true;
};
  `);
  console.log(`${colors.green}✓ Created suggest-deploy module${colors.reset}`);

  // Install the command globally
  execSync('npm link');
  console.log(`${colors.green}✓ Linked phixeo command globally${colors.reset}`);

  console.log(`\n${colors.cyan}Phixeo command is now available!${colors.reset}`);
  console.log(`You can use the following commands:`);
  console.log(`  ${colors.yellow}phixeo${colors.reset}          - Start the Phixeo OS interface`);
  console.log(`  ${colors.yellow}phixeo deploy${colors.reset}   - Deploy Phixeo to production`);
  console.log(`  ${colors.yellow}phixeo help${colors.reset}     - Show available commands`);
  
} catch (error) {
  console.error(`${colors.red}Error installing Phixeo command:${colors.reset}`, error.message);
}