/**
 * Phixeo Deployment Configuration
 * Optimized with golden ratio principles for maximum efficiency
 */

module.exports = {
  // Application name
  name: 'phixeo',
  
  // Entry point script
  script: 'server/index.ts',
  
  // Autoscaling configuration
  instances: 'max',
  exec_mode: 'cluster',
  
  // Environment variables
  env: {
    NODE_ENV: 'production',
    PORT: 5000
  },
  
  // Automatic restart configuration
  autorestart: true,
  watch: false,
  
  // Deployment metrics
  metrics: {
    enabled: true,
    port: 9100
  },
  
  // Phi-optimized performance config
  performance: {
    // Golden ratio-based settings
    max_memory_restart: '1G',
    // Phi-based optimization
    cpu_optimization: true,
    // Fractal node scaling
    node_args: '--max-old-space-size=1024'
  },
  
  // Apply phi-based logging patterns
  log_config: {
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    error_file: 'logs/phixeo-error.log',
    out_file: 'logs/phixeo-output.log',
    combine_logs: true,
    merge_logs: true,
    log_type: 'json'
  }
};