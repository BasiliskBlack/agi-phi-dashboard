import os
import sys
import json
import torch
import numpy as np
from typing import Dict, List, Any, Optional
from PyQt5.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                           QHBoxLayout, QPushButton, QLabel, QLineEdit, 
                           QTextEdit, QMessageBox, QSystemTrayIcon, QMenu,
                           QCompleter, QScrollArea, QFrame, QColorDialog,
                           QStyleFactory, QTabWidget, QComboBox, QSpinBox,
                           QCheckBox, QProgressBar)
from PyQt5.QtGui import QIcon, QFont, QPalette, QColor, QLinearGradient, QPainter, QPen, QBrush
from PyQt5.QtCore import Qt, QTimer, QSize, QSettings, pyqtSignal
import psutil
import GPUtil
from phixeo_editor import PhixeoEditor
from phixeo_ai import PhixeoAI
import networkx as nx
import matplotlib.pyplot as plt
from transformers import AutoTokenizer, AutoModelForCausalLM, AutoModelForSequenceClassification
import cv2
import ast
import inspect
import logging
from datetime import datetime
import speech_recognition as sr
import pyttsx3
import threading
import queue
import subprocess
import ast
import ast

class AIAssistant:
    """Advanced AI assistant for the operating system."""
    
    def __init__(self):
        self.tokenizer = AutoTokenizer.from_pretrained("gpt2-large")
        self.model = AutoModelForCausalLM.from_pretrained("gpt2-large")
        self.voice_engine = pyttsx3.init()
        self.recognizer = sr.Recognizer()
        self.command_queue = queue.Queue()
        self.context_history = []
        self._setup_voice()
        
    def _setup_voice(self):
        """Setup voice recognition and synthesis."""
        self.voice_engine.setProperty('rate', 150)
        self.voice_engine.setProperty('volume', 0.9)
        
    def process_command(self, command: str) -> Dict[str, Any]:
        """Process user command."""
        # Add command to context
        this.context_history.append({
            "type": "command",
            "content": command,
            "timestamp": datetime.now().isoformat()
        })
        
        # Generate response
        inputs = this.tokenizer(command, return_tensors="pt")
        outputs = this.model.generate(
            inputs.input_ids,
            max_length=200,
            num_return_sequences=1,
            temperature=0.7,
            top_p=0.9
        )
        
        response = this.tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Add response to context
        this.context_history.append({
            "type": "response",
            "content": response,
            "timestamp": datetime.now().isoformat()
        })
        
        return {
            "response": response,
            "context": this.context_history[-5:],
            "timestamp": datetime.now().isoformat()
        }
        
    def speak(self, text: str):
        """Convert text to speech."""
        this.voice_engine.say(text)
        this.voice_engine.runAndWait()
        
    def listen(self) -> str:
        """Listen for voice command."""
        with sr.Microphone() as source:
            this.recognizer.adjust_for_ambient_noise(source)
            audio = this.recognizer.listen(source)
            
        try:
            text = this.recognizer.recognize_google(audio)
            return text
        except:
            return ""

class SystemMonitor:
    """System monitoring and resource management."""
    
    def __init__(self):
        this.metrics = {}
        this.alerts = []
        this._setup_monitoring()
        
    def _setup_monitoring(self):
        """Setup system monitoring."""
        this.monitor_timer = QTimer()
        this.monitor_timer.timeout.connect(this._update_metrics)
        this.monitor_timer.start(1000)  # Update every second
        
    def _update_metrics(self):
        """Update system metrics."""
        # CPU metrics
        this.metrics["cpu"] = {
            "usage": psutil.cpu_percent(),
            "cores": psutil.cpu_count(),
            "frequency": psutil.cpu_freq().current
        }
        
        # Memory metrics
        memory = psutil.virtual_memory()
        this.metrics["memory"] = {
            "total": memory.total,
            "available": memory.available,
            "used": memory.used,
            "percent": memory.percent
        }
        
        # GPU metrics
        try:
            gpus = GPUtil.getGPUs()
            this.metrics["gpu"] = [
                {
                    "name": gpu.name,
                    "load": gpu.load,
                    "memory": gpu.memoryUsed,
                    "temperature": gpu.temperature
                }
                for gpu in gpus
            ]
        except:
            this.metrics["gpu"] = []
            
        # Disk metrics
        this.metrics["disk"] = {
            "partitions": [
                {
                    "device": partition.device,
                    "mountpoint": partition.mountpoint,
                    "fstype": partition.fstype,
                    "opts": partition.opts
                }
                for partition in psutil.disk_partitions()
            ],
            "usage": {
                partition.mountpoint: psutil.disk_usage(partition.mountpoint)._asdict()
                for partition in psutil.disk_partitions()
            }
        }
        
        # Network metrics
        this.metrics["network"] = {
            "interfaces": psutil.net_if_stats(),
            "addresses": psutil.net_if_addrs(),
            "connections": len(psutil.net_connections())
        }
        
        # Check for alerts
        this._check_alerts()
        
    def _check_alerts(self):
        """Check for system alerts."""
        alerts = []
        
        # CPU alerts
        if this.metrics["cpu"]["usage"] > 90:
            alerts.append({
                "type": "cpu",
                "level": "warning",
                "message": "High CPU usage detected"
            })
            
        # Memory alerts
        if this.metrics["memory"]["percent"] > 90:
            alerts.append({
                "type": "memory",
                "level": "warning",
                "message": "High memory usage detected"
            })
            
        # GPU alerts
        for gpu in this.metrics["gpu"]:
            if gpu["temperature"] > 80:
                alerts.append({
                    "type": "gpu",
                    "level": "warning",
                    "message": f"High GPU temperature detected: {gpu['name']}"
                })
                
        # Disk alerts
        for mountpoint, usage in this.metrics["disk"]["usage"].items():
            if usage["percent"] > 90:
                alerts.append({
                    "type": "disk",
                    "level": "warning",
                    "message": f"Low disk space on {mountpoint}"
                })
                
        this.alerts = alerts

class SecurityManager:
    """System security management."""
    
    def __init__(self):
        this.policies = {}
        this.violations = []
        this._load_policies()
        
    def _load_policies(self):
        """Load security policies."""
        this.policies = {
            "file_access": {
                "enabled": True,
                "rules": [
                    {
                        "path": "/etc/*",
                        "action": "deny",
                        "users": ["*"]
                    }
                ]
            },
            "network": {
                "enabled": True,
                "rules": [
                    {
                        "port": 22,
                        "action": "allow",
                        "ips": ["192.168.1.0/24"]
                    }
                ]
            },
            "process": {
                "enabled": True,
                "rules": [
                    {
                        "name": "malware",
                        "action": "terminate"
                    }
                ]
            }
        }
        
    def check_security(self, action: Dict[str, Any]) -> bool:
        """Check if action violates security policies."""
        # Check file access
        if action["type"] == "file_access":
            for rule in this.policies["file_access"]["rules"]:
                if this._match_path(action["path"], rule["path"]):
                    if action["user"] in rule["users"]:
                        if rule["action"] == "deny":
                            this.violations.append({
                                "type": "file_access",
                                "action": action,
                                "rule": rule,
                                "timestamp": datetime.now().isoformat()
                            })
                            return False
                            
        # Check network access
        elif action["type"] == "network":
            for rule in this.policies["network"]["rules"]:
                if action["port"] == rule["port"]:
                    if not this._match_ip(action["ip"], rule["ips"]):
                        this.violations.append({
                            "type": "network",
                            "action": action,
                            "rule": rule,
                            "timestamp": datetime.now().isoformat()
                        })
                        return False
                        
        # Check process execution
        elif action["type"] == "process":
            for rule in this.policies["process"]["rules"]:
                if action["name"] == rule["name"]:
                    this.violations.append({
                        "type": "process",
                        "action": action,
                        "rule": rule,
                        "timestamp": datetime.now().isoformat()
                    })
                    return False
                    
        return True
        
    def _match_path(self, path: str, pattern: str) -> bool:
        """Match path against pattern."""
        # Implement path matching logic
        return False
        
    def _match_ip(self, ip: str, patterns: List[str]) -> bool:
        """Match IP against patterns."""
        # Implement IP matching logic
        return False

class PhixeoOS(QMainWindow):
    """Main AI operating system interface."""
    
    def __init__(self):
        super().__init__()
        self.ai = PhixeoAI()
        self.editor = PhixeoEditor()
        self.settings = QSettings("Phixeo", "OS")
        self.setWindowTitle("Phixeo OS")
        self.setGeometry(100, 100, 1200, 800)
        
        # Load theme
        self._load_theme()
        
        # Setup UI
        self._setup_ui()
        self._setup_system_tray()
        self._setup_performance_monitor()
        self._setup_ai_assistant()
        
    def _load_theme(self):
        """Load saved theme or use default."""
        self.current_theme = self.settings.value("theme", "dark")
        self.accent_color = QColor(self.settings.value("accent_color", "#007AFF"))
        self._apply_theme()
        
    def _apply_theme(self):
        """Apply current theme to the application."""
        palette = QPalette()
        
        if self.current_theme == "dark":
            # Dark theme colors
            palette.setColor(QPalette.Window, QColor(30, 30, 30))
            palette.setColor(QPalette.WindowText, QColor(255, 255, 255))
            palette.setColor(QPalette.Base, QColor(45, 45, 45))
            palette.setColor(QPalette.AlternateBase, QColor(60, 60, 60))
            palette.setColor(QPalette.ToolTipBase, QColor(30, 30, 30))
            palette.setColor(QPalette.ToolTipText, QColor(255, 255, 255))
            palette.setColor(QPalette.Text, QColor(255, 255, 255))
            palette.setColor(QPalette.Button, QColor(45, 45, 45))
            palette.setColor(QPalette.ButtonText, QColor(255, 255, 255))
            palette.setColor(QPalette.BrightText, self.accent_color)
            palette.setColor(QPalette.Link, self.accent_color)
            palette.setColor(QPalette.Highlight, self.accent_color)
            palette.setColor(QPalette.HighlightedText, QColor(255, 255, 255))
        else:
            # Light theme colors
            palette.setColor(QPalette.Window, QColor(240, 240, 240))
            palette.setColor(QPalette.WindowText, QColor(0, 0, 0))
            palette.setColor(QPalette.Base, QColor(255, 255, 255))
            palette.setColor(QPalette.AlternateBase, QColor(245, 245, 245))
            palette.setColor(QPalette.ToolTipBase, QColor(255, 255, 255))
            palette.setColor(QPalette.ToolTipText, QColor(0, 0, 0))
            palette.setColor(QPalette.Text, QColor(0, 0, 0))
            palette.setColor(QPalette.Button, QColor(240, 240, 240))
            palette.setColor(QPalette.ButtonText, QColor(0, 0, 0))
            palette.setColor(QPalette.BrightText, self.accent_color)
            palette.setColor(QPalette.Link, self.accent_color)
            palette.setColor(QPalette.Highlight, self.accent_color)
            palette.setColor(QPalette.HighlightedText, QColor(255, 255, 255))
            
        QApplication.setPalette(palette)
        
        # Apply custom styles
        self._apply_custom_styles()
        
    def _apply_custom_styles(self):
        """Apply custom styles to widgets."""
        # Button style
        button_style = f"""
            QPushButton {{
                background-color: {self.accent_color.name()};
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                font-weight: bold;
            }}
            QPushButton:hover {{
                background-color: {self.accent_color.lighter(110).name()};
            }}
            QPushButton:pressed {{
                background-color: {self.accent_color.darker(110).name()};
            }}
        """
        
        # Line edit style
        line_edit_style = f"""
            QLineEdit {{
                background-color: {QApplication.palette().base().color().name()};
                border: 1px solid {self.accent_color.name()};
                border-radius: 4px;
                padding: 5px;
            }}
            QLineEdit:focus {{
                border: 2px solid {self.accent_color.name()};
            }}
        """
        
        # Text edit style
        text_edit_style = f"""
            QTextEdit {{
                background-color: {QApplication.palette().base().color().name()};
                border: 1px solid {self.accent_color.name()};
                border-radius: 4px;
                padding: 5px;
            }}
        """
        
        # Apply styles to widgets
        for widget in self.findChildren(QPushButton):
            widget.setStyleSheet(button_style)
            
        for widget in self.findChildren(QLineEdit):
            widget.setStyleSheet(line_edit_style)
            
        for widget in self.findChildren(QTextEdit):
            widget.setStyleSheet(text_edit_style)
            
    def _setup_ui(self):
        """Setup the main UI components."""
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        layout = QVBoxLayout(central_widget)
        
        # Header with AI Assistant
        header = QWidget()
        header_layout = QHBoxLayout(header)
        
        # System info with AI status
        self.system_info = QLabel()
        self._update_system_info()
        header_layout.addWidget(self.system_info)
        
        # Enhanced AI Assistant input
        self.ai_input = QLineEdit()
        self.ai_input.setPlaceholderText("Ask AI Assistant... (e.g., 'open my documents' or 'optimize system')")
        self.ai_input.setCompleter(QCompleter(self.ai.get_suggestions("")))
        self.ai_input.returnPressed.connect(self._handle_ai_query)
        self.ai_input.textChanged.connect(self._update_suggestions)
        header_layout.addWidget(self.ai_input)
        
        layout.addWidget(header)
        
        # Main content with AI Dashboard
        content = QTabWidget()
        
        # Dashboard tab
        dashboard = QWidget()
        dashboard_layout = QVBoxLayout(dashboard)
        
        # System metrics
        metrics_frame = QFrame()
        metrics_frame.setFrameStyle(QFrame.StyledPanel)
        metrics_layout = QVBoxLayout(metrics_frame)
        
        # CPU usage
        cpu_label = QLabel("CPU Usage: 0%")
        metrics_layout.addWidget(cpu_label)
        
        # Memory usage
        memory_label = QLabel("Memory Usage: 0%")
        metrics_layout.addWidget(memory_label)
        
        # GPU usage
        gpu_label = QLabel("GPU Usage: 0%")
        metrics_layout.addWidget(gpu_label)
        
        dashboard_layout.addWidget(metrics_frame)
        
        # AI Assistant
        assistant_frame = QFrame()
        assistant_frame.setFrameStyle(QFrame.StyledPanel)
        assistant_layout = QVBoxLayout(assistant_frame)
        
        # Command input
        command_input = QLineEdit()
        command_input.setPlaceholderText("Enter command or speak...")
        assistant_layout.addWidget(command_input)
        
        # Response area
        response_area = QTextEdit()
        response_area.setReadOnly(True)
        assistant_layout.addWidget(response_area)
        
        # Voice control buttons
        voice_controls = QWidget()
        voice_layout = QHBoxLayout(voice_controls)
        
        speak_btn = QPushButton("Speak")
        speak_btn.clicked.connect(lambda: self._handle_voice_input())
        voice_layout.addWidget(speak_btn)
        
        listen_btn = QPushButton("Listen")
        listen_btn.clicked.connect(lambda: self._handle_voice_output())
        voice_layout.addWidget(listen_btn)
        
        assistant_layout.addWidget(voice_controls)
        
        dashboard_layout.addWidget(assistant_frame)
        
        content.addTab(dashboard, "Dashboard")
        
        # Security tab
        security = QWidget()
        security_layout = QVBoxLayout(security)
        
        # Security status
        security_status = QLabel("Security Status: Active")
        security_status.setStyleSheet("color: green; font-weight: bold;")
        security_layout.addWidget(security_status)
        
        # Policy editor
        policy_editor = QTextEdit()
        policy_editor.setText(json.dumps(self.security.policies, indent=2))
        security_layout.addWidget(policy_editor)
        
        # Violations log
        violations_log = QTextEdit()
        violations_log.setReadOnly(True)
        security_layout.addWidget(violations_log)
        
        content.addTab(security, "Security")
        
        # Settings tab
        settings = QWidget()
        settings_layout = QVBoxLayout(settings)
        
        # Theme settings
        theme_frame = QFrame()
        theme_frame.setFrameStyle(QFrame.StyledPanel)
        theme_layout = QVBoxLayout(theme_frame)
        
        theme_label = QLabel("Theme")
        theme_layout.addWidget(theme_label)
        
        theme_selector = QComboBox()
        theme_selector.addItems(["Light", "Dark", "System"])
        theme_layout.addWidget(theme_selector)
        
        settings_layout.addWidget(theme_frame)
        
        # AI settings
        ai_frame = QFrame()
        ai_frame.setFrameStyle(QFrame.StyledPanel)
        ai_layout = QVBoxLayout(ai_frame)
        
        ai_label = QLabel("AI Assistant Settings")
        ai_layout.addWidget(ai_label)
        
        voice_enabled = QCheckBox("Enable Voice Control")
        voice_enabled.setChecked(True)
        ai_layout.addWidget(voice_enabled)
        
        context_aware = QCheckBox("Enable Context Awareness")
        context_aware.setChecked(True)
        ai_layout.addWidget(context_aware)
        
        settings_layout.addWidget(ai_frame)
        
        content.addTab(settings, "Settings")
        
        layout.addWidget(content)
        
        # Status bar with AI status
        self.statusBar().showMessage("AI Assistant Ready")
        
    def _setup_system_tray(self):
        """Setup system tray icon and menu."""
        self.tray_icon = QSystemTrayIcon(self)
        self.tray_icon.setIcon(QIcon("phixeo_icon.png"))
        
        tray_menu = QMenu()
        tray_menu.addAction("Show", self.show)
        tray_menu.addAction("Hide", self.hide)
        tray_menu.addSeparator()
        tray_menu.addAction("Exit", self.close)
        
        # Add theme menu items
        theme_menu = QMenu("Theme")
        theme_menu.addAction("Toggle Theme", self._toggle_theme)
        theme_menu.addAction("Choose Accent Color", self._choose_accent_color)
        
        tray_menu.insertMenu(tray_menu.addSeparator(), theme_menu)
        
        self.tray_icon.setContextMenu(tray_menu)
        self.tray_icon.show()
        
    def _setup_performance_monitor(self):
        """Setup performance monitoring."""
        self.perf_timer = QTimer()
        self.perf_timer.timeout.connect(self._update_performance)
        self.perf_timer.start(1000)  # Update every second
        
    def _setup_ai_assistant(self):
        """Setup AI assistant features."""
        # Create AI suggestion timer
        self.suggestion_timer = QTimer()
        self.suggestion_timer.setSingleShot(True)
        self.suggestion_timer.timeout.connect(self._update_suggestions)
        
        # Initialize AI context
        self._update_ai_context()
        
    def _update_suggestions(self):
        """Update AI command suggestions."""
        partial_query = self.ai_input.text()
        if len(partial_query) >= 2:
            suggestions = self.ai.get_suggestions(partial_query)
            self.ai_input.setCompleter(QCompleter(suggestions))
            
    def _update_ai_context(self):
        """Update AI context panel with relevant information."""
        context = self.ai.context
        if context["last_command"]:
            self.system_info.setText(
                f"Last command: {context['last_command']}\n"
                f"System state: {context['system_state']}\n"
                f"AI Status: Active and Learning"
            )
            
    def _handle_ai_query(self):
        """Handle AI assistant queries with enhanced feedback."""
        query = self.ai_input.text()
        if not query:
            return
            
        # Process query with AI
        response = self.ai.process_query(query)
        
        # Show response in a more user-friendly way
        msg = QMessageBox(self)
        msg.setIcon(QMessageBox.Information)
        msg.setWindowTitle("AI Assistant")
        msg.setText(response)
        
        # Add AI suggestions if available
        suggestions = self.ai.get_suggestions(query)
        if suggestions:
            msg.setDetailedText("Related commands:\n" + "\n".join(suggestions))
            
        msg.exec_()
        
        # Update AI context
        self._update_ai_context()
        
        # Clear input
        self.ai_input.clear()
        
    def _optimize_system(self):
        """Optimize system using AI."""
        optimization = self.ai.optimize_system()
        
        # Show optimization results
        msg = QMessageBox(self)
        msg.setIcon(QMessageBox.Information)
        msg.setWindowTitle("AI System Optimization")
        
        # Format performance data
        perf_data = optimization["performance_data"]
        perf_text = (
            f"CPU Usage: {perf_data['cpu_usage']}%\n"
            f"Memory Usage: {perf_data['memory_usage']}%\n"
            f"GPU Usage: {', '.join(f'{u*100:.1f}%' for u in perf_data['gpu_usage'])}"
        )
        
        msg.setText("System Optimization Results")
        msg.setDetailedText(
            f"Performance Metrics:\n{perf_text}\n\n"
            f"AI Suggestions:\n" + "\n".join(optimization["suggestions"])
        )
        
        msg.exec_()
        
    def _update_performance(self):
        """Update performance metrics with AI insights."""
        cpu_percent = psutil.cpu_percent()
        memory = psutil.virtual_memory()
        gpus = GPUtil.getGPUs()
        
        gpu_info = ""
        if gpus:
            gpu = gpus[0]
            gpu_info = f"GPU: {gpu.load*100:.1f}% | "
            
        # Add AI insights
        ai_status = "AI: Active"
        if cpu_percent > 80 or memory.percent > 80:
            ai_status = "AI: Optimizing"
            
        self.system_info.setText(
            f"CPU: {cpu_percent}% | "
            f"RAM: {memory.percent}% | "
            f"{gpu_info}"
            f"{ai_status}"
        )
        
        # Update AI context with performance data
        self.ai.context["system_state"] = {
            "cpu": cpu_percent,
            "memory": memory.percent,
            "gpu": [gpu.load for gpu in gpus] if gpus else []
        }
        self._update_ai_context()
        
    def _open_editor(self):
        """Open the Phixeo editor."""
        self.editor.show()
        
    def _open_settings(self):
        """Open system settings."""
        # TODO: Implement system settings dialog
        QMessageBox.information(self, "Settings", "System settings coming soon!")
        
    def _open_file_manager(self):
        """Open file manager."""
        if sys.platform == "win32":
            os.startfile(os.path.expanduser("~"))
        else:
            subprocess.Popen(["xdg-open", os.path.expanduser("~")])
            
    def _open_terminal(self):
        """Open terminal."""
        if sys.platform == "win32":
            subprocess.Popen(["cmd.exe"])
        else:
            subprocess.Popen(["x-terminal-emulator"])
            
    def _open_ai_dashboard(self):
        """Open AI dashboard."""
        # TODO: Implement AI dashboard
        QMessageBox.information(self, "AI Dashboard", "AI dashboard coming soon!")
        
    def _toggle_theme(self):
        """Toggle between light and dark themes."""
        self.current_theme = "light" if self.current_theme == "dark" else "dark"
        self.settings.setValue("theme", self.current_theme)
        self._apply_theme()
        
    def _choose_accent_color(self):
        """Open color picker for accent color."""
        color = QColorDialog.getColor(self.accent_color, self)
        if color.isValid():
            self.accent_color = color
            self.settings.setValue("accent_color", color.name())
            self._apply_theme()
        
    def closeEvent(self, event):
        """Handle application close."""
        reply = QMessageBox.question(
            self, "Exit",
            "Are you sure you want to exit?",
            QMessageBox.Yes | QMessageBox.No
        )
        
        if reply == QMessageBox.Yes:
            event.accept()
        else:
            event.ignore()
            
    def _handle_voice_input(self):
        """Handle voice input."""
        text = self.ai.listen()
        if text:
            command_input = self.ai_input
            if command_input:
                command_input.setText(text)
                
    def _handle_voice_output(self):
        """Handle voice output."""
        response_area = self.ai_input
        if response_area:
            text = response_area.toPlainText()
            if text:
                self.ai.speak(text)
        
def main():
    app = QApplication(sys.argv)
    
    # Set application style
    app.setStyle("Fusion")
    
    # Create and show main window
    window = PhixeoOS()
    window.show()
    
    sys.exit(app.exec_())
    
if __name__ == "__main__":
    main() 