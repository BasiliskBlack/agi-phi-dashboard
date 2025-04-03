#!/bin/bash

# Phixeo Deployment Script
# Optimized with golden ratio (1.618) principles

# Display Phixeo banner
echo ""
echo -e "\033[33m ██████╗ ██╗  ██╗██╗██╗  ██╗███████╗ ██████╗  \033[0m"
echo -e "\033[33m ██╔══██╗██║  ██║██║╚██╗██╔╝██╔════╝██╔═══██╗ \033[0m"
echo -e "\033[33m ██████╔╝███████║██║ ╚███╔╝ █████╗  ██║   ██║ \033[0m"
echo -e "\033[33m ██╔═══╝ ██╔══██║██║ ██╔██╗ ██╔══╝  ██║   ██║ \033[0m"
echo -e "\033[33m ██║     ██║  ██║██║██╔╝ ██╗███████╗╚██████╔╝ \033[0m"
echo -e "\033[33m ╚═╝     ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚══════╝ ╚═════╝  \033[0m"
echo -e "\033[38;5;240m     Auto-Deployment System v1.618        \033[0m"
echo ""

# Define phi-based constants for timing (in seconds)
PHI=1.618033988749895
COMPILE_TIMEOUT=$(echo "$PHI * 10" | bc)
BUILD_TIMEOUT=$(echo "$PHI * 20" | bc)
DEPLOY_TIMEOUT=$(echo "$PHI * 15" | bc)

# Phixeo directories
PHIXEO_ROOT="."
BUILD_DIR="$PHIXEO_ROOT/build"
CONFIG_PATH="$PHIXEO_ROOT/deploy.config.js"

# Verify deployment configuration exists
if [ ! -f "$CONFIG_PATH" ]; then
  echo -e "\033[31mError: deploy.config.js not found!\033[0m"
  exit 1
fi

# Function to display spinner with Phi-optimized timing
phi_spinner() {
  local pid=$1
  local delay=0.1
  local spinstr='|/-\'
  
  while [ "$(ps a | awk '{print $1}' | grep $pid)" ]; do
    local temp=${spinstr#?}
    printf "\r\033[33m [%c] \033[0m" "$spinstr"
    local spinstr=$temp${spinstr%"$temp"}
    sleep $delay
  done
  printf "\r\033[K"
}

# Step 1: Install dependencies if needed
echo -e "\033[38;5;240m[1/${PHI}] Checking dependencies...\033[0m"
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install &
  phi_spinner $!
fi

# Step 2: Build the application
echo -e "\033[38;5;240m[2/${PHI}] Building Phixeo OS...\033[0m"
npm run build &
build_pid=$!

# Display Phi-optimized spinner while building
phi_spinner $build_pid

# Check if build was successful
if [ $? -ne 0 ]; then
  echo -e "\033[31mError: Build failed!\033[0m"
  exit 1
fi

# Step 3: Prepare deployment
echo -e "\033[38;5;240m[3/${PHI}] Preparing deployment...\033[0m"
# Create logs directory if it doesn't exist
mkdir -p logs

# Step 4: Start deployment
echo -e "\033[38;5;240m[4/${PHI}] Deploying Phixeo OS...\033[0m"

# Check if we should use replit deployment
if [[ "$REPL_ID" != "" ]]; then
  echo "Deploying to Replit..."
  echo "Your application will be available at https://$REPL_SLUG.$REPL_OWNER.repl.co"
  
  # Suggest deployment through Replit UI
  echo ""
  echo -e "\033[33mTo complete deployment, click the 'Run' button in the Replit UI\033[0m"
  echo -e "\033[33mor use the 'Deploy' tab to set up a permanent deployment.\033[0m"
  
else
  # For local deployment, use the configuration
  echo "Starting Phixeo OS in production mode..."
  NODE_ENV=production npm start
fi

echo ""
echo -e "\033[32m✓ Phixeo OS deployment prepared!\033[0m"
echo -e "\033[33mPhi-optimization applied with ${PHI} factor\033[0m"
echo ""