import os
import sys
import json
import torch
import numpy as np
from typing import Dict, List, Any, Optional
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest
import pandas as pd
import logging
from datetime import datetime, timedelta
import psutil
import GPUtil
import matplotlib.pyplot as plt
import seaborn as sns
from collections import deque
import threading
import time
import queue
import torch.nn as nn
import torch.optim as optim

class SystemMonitor:
    """Advanced system monitoring and optimization."""
    
    def __init__(self):
        # Initialize metrics
        self.metrics = {
            "cpu": {},
            "memory": {},
            "gpu": {},
            "disk": {},
            "network": {},
            "processes": {},
            "timestamp": datetime.now().isoformat()
        }
        
        # Initialize analytics
        self.scaler = StandardScaler()
        self.anomaly_detector = IsolationForest(contamination=0.1)
        self.metrics_history = []
        self.alert_thresholds = self._load_alert_thresholds()
        
        # Initialize neural network for prediction
        self.prediction_model = self._create_prediction_model()
        self.optimizer = optim.Adam(self.prediction_model.parameters())
        
        # Initialize queues for async processing
        self.metrics_queue = queue.Queue()
        self.alert_queue = queue.Queue()
        
        # Setup logging
        self._setup_logging()
        
        # Start monitoring threads
        self._start_monitoring_threads()
        
    def _setup_logging(self):
        """Setup logging for system monitoring."""
        logging.basicConfig(
            filename='system_monitor.log',
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
        
    def _load_alert_thresholds(self) -> Dict[str, Dict[str, float]]:
        """Load alert thresholds from configuration."""
        return {
            "cpu": {
                "warning": 70.0,
                "critical": 90.0
            },
            "memory": {
                "warning": 75.0,
                "critical": 90.0
            },
            "gpu": {
                "warning": 80.0,
                "critical": 95.0
            },
            "disk": {
                "warning": 80.0,
                "critical": 95.0
            },
            "network": {
                "warning": 80.0,
                "critical": 95.0
            }
        }
        
    def _create_prediction_model(self) -> nn.Module:
        """Create neural network for system prediction."""
        class SystemPredictor(nn.Module):
            def __init__(self):
                super().__init__()
                self.lstm = nn.LSTM(
                    input_size=10,  # Number of metrics
                    hidden_size=64,
                    num_layers=2,
                    batch_first=True
                )
                self.fc = nn.Linear(64, 10)  # Predict next 10 values
                
            def forward(self, x):
                lstm_out, _ = self.lstm(x)
                return self.fc(lstm_out[:, -1, :])
                
        return SystemPredictor()
        
    def _start_monitoring_threads(self):
        """Start monitoring and processing threads."""
        # Start metrics collection thread
        self.metrics_thread = threading.Thread(
            target=self._collect_metrics_loop,
            daemon=True
        )
        self.metrics_thread.start()
        
        # Start alert processing thread
        self.alert_thread = threading.Thread(
            target=self._process_alerts_loop,
            daemon=True
        )
        self.alert_thread.start()
        
        # Start prediction thread
        self.prediction_thread = threading.Thread(
            target=self._update_predictions_loop,
            daemon=True
        )
        self.prediction_thread.start()
        
    def _collect_metrics_loop(self):
        """Continuous metrics collection loop."""
        while True:
            try:
                metrics = self._collect_metrics()
                self.metrics_queue.put(metrics)
                time.sleep(1)  # Collect every second
            except Exception as e:
                logging.error(f"Error collecting metrics: {e}")
                time.sleep(5)  # Wait longer on error
                
    def _process_alerts_loop(self):
        """Process alerts from queue."""
        while True:
            try:
                alert = self.alert_queue.get()
                self._handle_alert(alert)
            except Exception as e:
                logging.error(f"Error processing alert: {e}")
            time.sleep(0.1)
            
    def _update_predictions_loop(self):
        """Update predictions periodically."""
        while True:
            try:
                self._update_predictions()
                time.sleep(300)  # Update every 5 minutes
            except Exception as e:
                logging.error(f"Error updating predictions: {e}")
                time.sleep(60)
                
    def _collect_metrics(self) -> Dict[str, Any]:
        """Collect system metrics."""
        metrics = {
            "cpu": self._get_cpu_metrics(),
            "memory": self._get_memory_metrics(),
            "gpu": self._get_gpu_metrics(),
            "disk": self._get_disk_metrics(),
            "network": self._get_network_metrics(),
            "processes": self._get_process_metrics(),
            "timestamp": datetime.now().isoformat()
        }
        
        # Store in history
        self.metrics_history.append(metrics)
        if len(self.metrics_history) > 3600:  # Keep last hour
            self.metrics_history.pop(0)
            
        return metrics
        
    def _get_cpu_metrics(self) -> Dict[str, float]:
        """Get CPU metrics."""
        return {
            "usage_percent": psutil.cpu_percent(interval=1),
            "count": psutil.cpu_count(),
            "frequency": psutil.cpu_freq().current if psutil.cpu_freq() else 0,
            "temperature": self._get_cpu_temperature()
        }
        
    def _get_memory_metrics(self) -> Dict[str, float]:
        """Get memory metrics."""
        memory = psutil.virtual_memory()
        return {
            "total": memory.total,
            "available": memory.available,
            "used": memory.used,
            "percent": memory.percent
        }
        
    def _get_gpu_metrics(self) -> Dict[str, Any]:
        """Get GPU metrics."""
        try:
            gpus = GPUtil.getGPUs()
            if gpus:
                gpu = gpus[0]
                return {
                    "name": gpu.name,
                    "load": gpu.load * 100,
                    "memory_used": gpu.memoryUsed,
                    "memory_total": gpu.memoryTotal,
                    "temperature": gpu.temperature
                }
            return {}
        except:
            return {}
            
    def _get_disk_metrics(self) -> Dict[str, Any]:
        """Get disk metrics."""
        disk = psutil.disk_usage('/')
        return {
            "total": disk.total,
            "used": disk.used,
            "free": disk.free,
            "percent": disk.percent
        }
        
    def _get_network_metrics(self) -> Dict[str, float]:
        """Get network metrics."""
        net_io = psutil.net_io_counters()
        return {
            "bytes_sent": net_io.bytes_sent,
            "bytes_recv": net_io.bytes_recv,
            "packets_sent": net_io.packets_sent,
            "packets_recv": net_io.packets_recv
        }
        
    def _get_process_metrics(self) -> Dict[str, Any]:
        """Get process metrics."""
        processes = []
        for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']):
            try:
                processes.append(proc.info)
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass
                
        return {
            "total": len(processes),
            "top_cpu": sorted(processes, key=lambda x: x['cpu_percent'], reverse=True)[:5],
            "top_memory": sorted(processes, key=lambda x: x['memory_percent'], reverse=True)[:5]
        }
        
    def _get_cpu_temperature(self) -> Optional[float]:
        """Get CPU temperature if available."""
        try:
            temps = psutil.sensors_temperatures()
            if temps and 'coretemp' in temps:
                return temps['coretemp'][0].current
            return None
        except:
            return None
            
    def _handle_alert(self, alert: Dict[str, Any]):
        """Handle system alert."""
        # Log alert
        logging.warning(f"System alert: {json.dumps(alert)}")
        
        # Take action based on alert type
        if alert["type"] == "critical":
            self._handle_critical_alert(alert)
        elif alert["type"] == "warning":
            self._handle_warning_alert(alert)
            
    def _handle_critical_alert(self, alert: Dict[str, Any]):
        """Handle critical system alert."""
        # Emergency actions
        if alert["metric"] == "cpu" and alert["value"] > 95:
            self._emergency_cpu_throttling()
        elif alert["metric"] == "memory" and alert["value"] > 95:
            self._emergency_memory_cleanup()
        elif alert["metric"] == "disk" and alert["value"] > 95:
            self._emergency_disk_cleanup()
            
    def _handle_warning_alert(self, alert: Dict[str, Any]):
        """Handle warning system alert."""
        # Preventive actions
        if alert["metric"] == "cpu" and alert["value"] > 80:
            self._optimize_cpu_usage()
        elif alert["metric"] == "memory" and alert["value"] > 80:
            self._optimize_memory_usage()
        elif alert["metric"] == "disk" and alert["value"] > 80:
            self._optimize_disk_usage()
            
    def _emergency_cpu_throttling(self):
        """Emergency CPU throttling."""
        # Find and throttle CPU-intensive processes
        for proc in psutil.process_iter(['pid', 'name', 'cpu_percent']):
            try:
                if proc.info['cpu_percent'] > 50:
                    proc.nice(10)  # Lower priority
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass
                
    def _emergency_memory_cleanup(self):
        """Emergency memory cleanup."""
        # Clear system caches
        try:
            os.system('sync; echo 3 > /proc/sys/vm/drop_caches')
        except:
            pass
            
        # Kill memory-intensive processes
        for proc in psutil.process_iter(['pid', 'name', 'memory_percent']):
            try:
                if proc.info['memory_percent'] > 20:
                    proc.kill()
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass
                
    def _emergency_disk_cleanup(self):
        """Emergency disk cleanup."""
        # Clear temporary files
        temp_dirs = ['/tmp', '/var/tmp']
        for temp_dir in temp_dirs:
            try:
                os.system(f'rm -rf {temp_dir}/*')
            except:
                pass
                
    def _optimize_cpu_usage(self):
        """Optimize CPU usage."""
        # Adjust process priorities
        for proc in psutil.process_iter(['pid', 'name', 'cpu_percent']):
            try:
                if proc.info['cpu_percent'] > 30:
                    proc.nice(5)  # Slightly lower priority
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass
                
    def _optimize_memory_usage(self):
        """Optimize memory usage."""
        # Clear unused memory
        try:
            os.system('sync; echo 1 > /proc/sys/vm/drop_caches')
        except:
            pass
            
    def _optimize_disk_usage(self):
        """Optimize disk usage."""
        # Clear old log files
        log_dirs = ['/var/log']
        for log_dir in log_dirs:
            try:
                os.system(f'find {log_dir} -type f -name "*.log" -mtime +7 -delete')
            except:
                pass
                
    def _update_predictions(self):
        """Update system predictions."""
        if len(self.metrics_history) < 60:  # Need at least 1 minute of data
            return
            
        # Prepare training data
        features = self._prepare_prediction_features()
        if len(features) == 0:
            return
            
        # Train model
        self._train_prediction_model(features)
        
        # Generate predictions
        predictions = self._generate_predictions(features)
        
        # Check for predicted issues
        self._check_predicted_issues(predictions)
        
    def _prepare_prediction_features(self) -> np.ndarray:
        """Prepare features for prediction."""
        features = []
        
        for metrics in self.metrics_history:
            feature_vector = [
                metrics["cpu"]["usage_percent"],
                metrics["memory"]["percent"],
                metrics["disk"]["percent"],
                metrics["network"]["bytes_sent"],
                metrics["network"]["bytes_recv"],
                metrics["processes"]["total"],
                metrics["cpu"]["temperature"] or 0,
                metrics["gpu"].get("load", 0),
                metrics["gpu"].get("memory_used", 0),
                metrics["gpu"].get("temperature", 0)
            ]
            features.append(feature_vector)
            
        return np.array(features)
        
    def _train_prediction_model(self, features: np.ndarray):
        """Train prediction model."""
        # Prepare sequences
        sequence_length = 60  # 1 minute of data
        X, y = [], []
        
        for i in range(len(features) - sequence_length):
            X.append(features[i:i+sequence_length])
            y.append(features[i+sequence_length])
            
        X = torch.FloatTensor(X)
        y = torch.FloatTensor(y)
        
        # Train model
        self.prediction_model.train()
        for epoch in range(10):
            self.optimizer.zero_grad()
            outputs = self.prediction_model(X)
            loss = nn.MSELoss()(outputs, y)
            loss.backward()
            self.optimizer.step()
            
    def _generate_predictions(self, features: np.ndarray) -> Dict[str, Any]:
        """Generate system predictions."""
        # Prepare input sequence
        sequence = torch.FloatTensor(features[-60:]).unsqueeze(0)
        
        # Generate predictions
        self.prediction_model.eval()
        with torch.no_grad():
            predictions = self.prediction_model(sequence)
            
        # Format predictions
        return {
            "cpu_usage": float(predictions[0][0]),
            "memory_usage": float(predictions[0][1]),
            "disk_usage": float(predictions[0][2]),
            "network_sent": float(predictions[0][3]),
            "network_recv": float(predictions[0][4]),
            "process_count": float(predictions[0][5]),
            "cpu_temp": float(predictions[0][6]),
            "gpu_load": float(predictions[0][7]),
            "gpu_memory": float(predictions[0][8]),
            "gpu_temp": float(predictions[0][9])
        }
        
    def _check_predicted_issues(self, predictions: Dict[str, float]):
        """Check for predicted system issues."""
        # Check CPU
        if predictions["cpu_usage"] > self.alert_thresholds["cpu"]["warning"]:
            self.alert_queue.put({
                "type": "warning",
                "metric": "cpu",
                "value": predictions["cpu_usage"],
                "timestamp": datetime.now().isoformat()
            })
            
        # Check memory
        if predictions["memory_usage"] > self.alert_thresholds["memory"]["warning"]:
            self.alert_queue.put({
                "type": "warning",
                "metric": "memory",
                "value": predictions["memory_usage"],
                "timestamp": datetime.now().isoformat()
            })
            
        # Check disk
        if predictions["disk_usage"] > self.alert_thresholds["disk"]["warning"]:
            self.alert_queue.put({
                "type": "warning",
                "metric": "disk",
                "value": predictions["disk_usage"],
                "timestamp": datetime.now().isoformat()
            })
            
    def get_system_status(self) -> Dict[str, Any]:
        """Get current system status."""
        return {
            "metrics": self._collect_metrics(),
            "predictions": self._generate_predictions(self._prepare_prediction_features()),
            "alerts": self._get_active_alerts(),
            "optimizations": self._get_optimization_suggestions()
        }
        
    def _get_active_alerts(self) -> List[Dict[str, Any]]:
        """Get currently active alerts."""
        alerts = []
        metrics = self._collect_metrics()
        
        # Check CPU
        if metrics["cpu"]["usage_percent"] > self.alert_thresholds["cpu"]["warning"]:
            alerts.append({
                "type": "warning" if metrics["cpu"]["usage_percent"] <= self.alert_thresholds["cpu"]["critical"] else "critical",
                "metric": "cpu",
                "value": metrics["cpu"]["usage_percent"],
                "timestamp": datetime.now().isoformat()
            })
            
        # Check memory
        if metrics["memory"]["percent"] > self.alert_thresholds["memory"]["warning"]:
            alerts.append({
                "type": "warning" if metrics["memory"]["percent"] <= self.alert_thresholds["memory"]["critical"] else "critical",
                "metric": "memory",
                "value": metrics["memory"]["percent"],
                "timestamp": datetime.now().isoformat()
            })
            
        # Check disk
        if metrics["disk"]["percent"] > self.alert_thresholds["disk"]["warning"]:
            alerts.append({
                "type": "warning" if metrics["disk"]["percent"] <= self.alert_thresholds["disk"]["critical"] else "critical",
                "metric": "disk",
                "value": metrics["disk"]["percent"],
                "timestamp": datetime.now().isoformat()
            })
            
        return alerts
        
    def _get_optimization_suggestions(self) -> List[str]:
        """Get system optimization suggestions."""
        suggestions = []
        metrics = self._collect_metrics()
        
        # CPU suggestions
        if metrics["cpu"]["usage_percent"] > 70:
            suggestions.append("Consider closing resource-intensive applications")
            
        # Memory suggestions
        if metrics["memory"]["percent"] > 70:
            suggestions.append("Clear unused memory and cache")
            
        # Disk suggestions
        if metrics["disk"]["percent"] > 70:
            suggestions.append("Free up disk space by removing unnecessary files")
            
        # Process suggestions
        if metrics["processes"]["total"] > 100:
            suggestions.append("Review and close unnecessary background processes")
            
        return suggestions
        
    def plot_performance(self, component: str, metric: str):
        """Plot performance metrics."""
        if component not in self.metrics_history:
            return None
            
        # Get data
        data = list(self.metrics_history[component])
        if not data:
            return None
            
        # Create DataFrame
        df = pd.DataFrame(data)
        
        # Create plot
        plt.figure(figsize=(10, 6))
        sns.lineplot(data=df, y=metric)
        plt.title(f"{component.upper()} {metric} over time")
        plt.xlabel("Time")
        plt.ylabel(metric)
        
        # Save plot
        filename = f"performance_{component}_{metric}.png"
        plt.savefig(filename)
        plt.close()
        
        return filename
        
    def predict_resource_usage(self, time_window: int = 3600) -> Dict[str, Any]:
        """Predict resource usage for the next time window."""
        predictions = {}
        
        # Convert history to DataFrame
        for component, history in self.metrics_history.items():
            if history:
                df = pd.DataFrame(list(history))
                
                # Prepare features
                features = self._prepare_prediction_features(df)
                
                # Generate prediction
                prediction = self._generate_prediction(features, time_window)
                
                predictions[component] = prediction
                
        return predictions
        
    def _prepare_prediction_features(self, df: pd.DataFrame) -> np.ndarray:
        """Prepare features for prediction."""
        # TODO: Implement feature preparation
        return np.array([])
        
    def _generate_prediction(self, features: np.ndarray,
                           time_window: int) -> Dict[str, Any]:
        """Generate resource usage prediction."""
        # TODO: Implement prediction generation
        return {} 