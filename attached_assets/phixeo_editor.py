import sys
import json
from math import pi, sqrt, cos, sin
from PyQt5.QtWidgets import (QApplication, QMainWindow, QGraphicsView, QGraphicsScene, QVBoxLayout, QHBoxLayout, QWidget, 
                             QPushButton, QTextEdit, QLabel, QToolBar, QLineEdit, QFileDialog, QMessageBox, QFormLayout,
                             QGraphicsPolygonItem, QGraphicsLineItem, QGraphicsTextItem, QMenu, QInputDialog, QTabWidget,
                             QComboBox, QSpinBox, QCheckBox, QListWidget, QProgressBar, QSlider)
from PyQt5.QtGui import QPen, QColor, QPolygonF, QFont, QPainterPath, QPainter, QLinearGradient, QRadialGradient
from PyQt5.QtCore import Qt, QPointF, QEvent, QRectF, QTimer, QDateTime, QPropertyAnimation, QEasingCurve
from typing import List, Dict, Optional
import numpy as np
import sqlite3
import hashlib
import requests
from datetime import datetime
import threading
import queue
import torch
import torch.nn as nn
from transformers import AutoTokenizer, AutoModel
import matplotlib.pyplot as plt
from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas
import networkx as nx
from scipy.spatial import ConvexHull
import colorsys
from phixeo_effects import (GlowEffect, ParticleEffect, MorphingEffect,
                          WaveEffect, GoldenSpiralEffect, FractalEffect)

class PhixeoAI:
    """AI-powered features for Phixeo."""
    
    def __init__(self):
        self.tokenizer = AutoTokenizer.from_pretrained("microsoft/codebert-base")
        self.model = AutoModel.from_pretrained("microsoft/codebert-base")
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model.to(self.device)
        
    def suggest_code(self, context: str) -> str:
        """Generate code suggestions using CodeBERT."""
        inputs = self.tokenizer(context, return_tensors="pt", padding=True, truncation=True)
        inputs = {k: v.to(self.device) for k, v in inputs.items()}
        
        with torch.no_grad():
            outputs = self.model(**inputs)
            embeddings = outputs.last_hidden_state.mean(dim=1)
            
        # Use embeddings to generate suggestions
        # This is a simplified version - in production, you'd use a more sophisticated generation model
        return "def process_data(data):\n    return [x * 2 for x in data]"
        
    def analyze_complexity(self, nodes: List[Dict], connections: List[Dict]) -> Dict:
        """Analyze code complexity using graph theory."""
        G = nx.DiGraph()
        
        # Build graph
        for i, node in enumerate(nodes):
            G.add_node(i, type=node["type"], value=node["value"])
            
        for conn in connections:
            G.add_edge(conn["source"], conn["target"])
            
        # Calculate metrics
        metrics = {
            "cyclomatic_complexity": nx.number_of_edges(G) - nx.number_of_nodes(G) + 2,
            "average_path_length": nx.average_shortest_path_length(G) if nx.is_strongly_connected(G) else float('inf'),
            "node_degree_distribution": dict(nx.degree_histogram(G)),
            "clustering_coefficient": nx.average_clustering(G) if nx.is_strongly_connected(G) else 0
        }
        
        return metrics

class PhixeoVisualizer:
    """Advanced visualization features for Phixeo."""
    
    def __init__(self):
        self.colors = self._generate_color_palette()
        self.animations = []
        
    def _generate_color_palette(self) -> List[QColor]:
        """Generate a harmonious color palette using golden ratio."""
        colors = []
        golden_ratio = (1 + sqrt(5)) / 2
        hue = 0
        
        for i in range(10):
            hue = (hue + 1/golden_ratio) % 1
            rgb = colorsys.hsv_to_rgb(hue, 0.7, 0.9)
            colors.append(QColor(int(rgb[0]*255), int(rgb[1]*255), int(rgb[2]*255)))
            
        return colors
        
    def create_node_gradient(self, base_color: QColor) -> QLinearGradient:
        """Create a beautiful gradient for nodes."""
        gradient = QLinearGradient(0, 0, 0, 1)
        gradient.setColorAt(0, base_color.lighter(120))
        gradient.setColorAt(1, base_color.darker(120))
        return gradient
        
    def create_connection_animation(self, line: QGraphicsLineItem, 
                                 start: QPointF, end: QPointF) -> QPropertyAnimation:
        """Create a flowing animation for connections."""
        animation = QPropertyAnimation(line, b"geometry")
        animation.setDuration(1000)
        animation.setEasingCurve(QEasingCurve.InOutCubic)
        
        # Create flowing effect
        path = QPainterPath()
        path.moveTo(start)
        path.lineTo(end)
        
        animation.setStartValue(QRectF(start.x(), start.y(), 0, 0))
        animation.setEndValue(QRectF(end.x(), end.y(), 0, 0))
        
        return animation
        
    def create_complexity_visualization(self, metrics: Dict) -> FigureCanvas:
        """Create a matplotlib visualization of code complexity."""
        fig, ax = plt.subplots(figsize=(8, 6))
        
        # Plot degree distribution
        degrees = list(metrics["node_degree_distribution"].keys())
        counts = list(metrics["node_degree_distribution"].values())
        ax.bar(degrees, counts, color=self.colors[0].name())
        
        ax.set_title("Node Degree Distribution")
        ax.set_xlabel("Degree")
        ax.set_ylabel("Count")
        
        return FigureCanvas(fig)

class PhixeoEnterprise:
    """Enterprise features for Phixeo including team collaboration and analytics."""
    
    def __init__(self):
        self.db = sqlite3.connect('phixeo_enterprise.db')
        self._setup_database()
        self.collaboration_queue = queue.Queue()
        self.analytics_thread = threading.Thread(target=self._process_analytics, daemon=True)
        self.analytics_thread.start()

    def _setup_database(self):
        """Setup enterprise database tables."""
        self.db.execute('''
            CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY,
                name TEXT,
                created_at TIMESTAMP,
                last_modified TIMESTAMP,
                owner_id INTEGER,
                team_id INTEGER
            )
        ''')
        
        self.db.execute('''
            CREATE TABLE IF NOT EXISTS nodes (
                id INTEGER PRIMARY KEY,
                project_id INTEGER,
                type TEXT,
                value TEXT,
                position_x REAL,
                position_y REAL,
                created_at TIMESTAMP,
                modified_at TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects (id)
            )
        ''')
        
        self.db.execute('''
            CREATE TABLE IF NOT EXISTS connections (
                id INTEGER PRIMARY KEY,
                project_id INTEGER,
                source_node_id INTEGER,
                target_node_id INTEGER,
                created_at TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects (id),
                FOREIGN KEY (source_node_id) REFERENCES nodes (id),
                FOREIGN KEY (target_node_id) REFERENCES nodes (id)
            )
        ''')
        
        self.db.execute('''
            CREATE TABLE IF NOT EXISTS analytics (
                id INTEGER PRIMARY KEY,
                project_id INTEGER,
                metric_name TEXT,
                metric_value REAL,
                recorded_at TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects (id)
            )
        ''')
        
        self.db.commit()

    def create_project(self, name: str, owner_id: int, team_id: int) -> int:
        """Create a new enterprise project."""
        now = datetime.now()
        cursor = self.db.cursor()
        cursor.execute('''
            INSERT INTO projects (name, created_at, last_modified, owner_id, team_id)
            VALUES (?, ?, ?, ?, ?)
        ''', (name, now, now, owner_id, team_id))
        self.db.commit()
        return cursor.lastrowid

    def save_project_state(self, project_id: int, nodes: List[Dict], connections: List[Dict]):
        """Save project state with versioning."""
        now = datetime.now()
        cursor = self.db.cursor()
        
        # Clear existing nodes and connections
        cursor.execute('DELETE FROM nodes WHERE project_id = ?', (project_id,))
        cursor.execute('DELETE FROM connections WHERE project_id = ?', (project_id,))
        
        # Save new nodes
        for node in nodes:
            cursor.execute('''
                INSERT INTO nodes (project_id, type, value, position_x, position_y, created_at, modified_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (project_id, node["type"], node["value"], node["x"], node["y"], now, now))
            
        # Save new connections
        for conn in connections:
            cursor.execute('''
                INSERT INTO connections (project_id, source_node_id, target_node_id, created_at)
                VALUES (?, ?, ?, ?)
            ''', (project_id, conn["source"], conn["target"], now))
            
        # Update project last modified
        cursor.execute('''
            UPDATE projects SET last_modified = ? WHERE id = ?
        ''', (now, project_id))
        
        self.db.commit()

    def _process_analytics(self):
        """Process analytics in background thread."""
        while True:
            try:
                data = self.collaboration_queue.get()
                self._record_analytics(data)
            except Exception as e:
                print(f"Analytics error: {e}")

    def _record_analytics(self, data: Dict):
        """Record analytics metrics."""
        cursor = self.db.cursor()
        now = datetime.now()
        
        # Record complexity metrics
        cursor.execute('''
            INSERT INTO analytics (project_id, metric_name, metric_value, recorded_at)
            VALUES (?, 'node_count', ?, ?)
        ''', (data["project_id"], data["node_count"], now))
        
        cursor.execute('''
            INSERT INTO analytics (project_id, metric_name, metric_value, recorded_at)
            VALUES (?, 'connection_count', ?, ?)
        ''', (data["project_id"], data["connection_count"], now))
        
        # Record performance metrics
        cursor.execute('''
            INSERT INTO analytics (project_id, metric_name, metric_value, recorded_at)
            VALUES (?, 'render_time', ?)
        ''', (data["project_id"], data["render_time"], now))
        
        self.db.commit()

    def get_project_analytics(self, project_id: int) -> Dict:
        """Get project analytics summary."""
        cursor = self.db.cursor()
        
        # Get latest metrics
        cursor.execute('''
            SELECT metric_name, metric_value
            FROM analytics
            WHERE project_id = ?
            AND recorded_at = (
                SELECT MAX(recorded_at)
                FROM analytics
                WHERE project_id = ?
            )
        ''', (project_id, project_id))
        
        metrics = dict(cursor.fetchall())
        
        # Calculate trends
        cursor.execute('''
            SELECT metric_name, AVG(metric_value) as avg_value
            FROM analytics
            WHERE project_id = ?
            GROUP BY metric_name
        ''', (project_id,))
        
        trends = dict(cursor.fetchall())
        
        return {
            "current_metrics": metrics,
            "trends": trends
        }

class PhixeoEditor(QMainWindow):
    """Phixeo Editor: Interactive IDE with advanced features."""
    
    def __init__(self):
        super().__init__()
        self.ai = PhixeoAI()
        self.visualizer = PhixeoVisualizer()
        self.enterprise = PhixeoEnterprise()
        self.current_project_id = None
        self.team_members = []
        self.setWindowTitle("Phixeo Editor - Visual Programming with Golden Spiral")
        self.setGeometry(100, 100, 1200, 800)
        self.phi = (1 + sqrt(5)) / 2
        self.constants = {
            "Tetrahedral": (pi**2 + self.phi * sqrt(5)) / 2,  # ~7.416
            "Hexagonal": pi + (2 * sqrt(3)) / self.phi,       # ~4.373
            "Pentagonal": (pi + self.phi + sqrt(5)) / 3,      # ~2.327
            "Fractal": pi * self.phi**2 + sqrt(2)             # ~9.737
        }
        self.base_a = 50.0
        self.golden_angle = 2.399
        self.nodes = []
        self.lines = []
        self.action_history = []
        self.redo_history = []
        self.selected_item = None
        self.drag_offset = None
        self.connecting = False
        self.start_item = None
        self.dragging = False
        self.last_pos = None
        self.zoom_factor = 1.0
        self.effects = {
            'glow': GlowEffect(QColor(255, 255, 255, 100)),
            'particles': ParticleEffect(QColor(100, 200, 255, 150)),
            'wave': WaveEffect(amplitude=5.0, frequency=0.05),
            'spiral': GoldenSpiralEffect(QColor(255, 215, 0, 100)),
            'fractal': FractalEffect(QColor(100, 100, 255, 50))
        }
        self._setup_ui()
        self._setup_optimizations()
        self._setup_enterprise_ui()
        self._setup_advanced_features()
        self._setup_effects()

    def _setup_advanced_features(self):
        """Setup advanced visualization and AI features."""
        # Add AI toolbar
        ai_toolbar = QToolBar("AI Assistant")
        self.addToolBar(Qt.TopToolBarArea, ai_toolbar)
        
        ai_toolbar.addAction("Suggest Code", self._suggest_code)
        ai_toolbar.addAction("Analyze Complexity", self._analyze_complexity)
        ai_toolbar.addAction("Optimize Layout", self._optimize_layout)
        
        # Add visualization panel
        self.visualization_panel = QTabWidget()
        self.visualization_panel.addTab(self._create_complexity_tab(), "Complexity")
        self.visualization_panel.addTab(self._create_metrics_tab(), "Metrics")
        self.visualization_panel.hide()
        
        # Add to main layout
        self.main_layout.addWidget(self.visualization_panel)

    def _create_complexity_tab(self) -> QWidget:
        """Create complexity visualization tab."""
        complexity_tab = QWidget()
        layout = QVBoxLayout(complexity_tab)
        
        # Complexity graph
        self.complexity_canvas = None
        layout.addWidget(QLabel("Code Complexity Analysis"))
        
        # Metrics display
        self.metrics_display = QTextEdit()
        self.metrics_display.setReadOnly(True)
        layout.addWidget(self.metrics_display)
        
        return complexity_tab

    def _create_metrics_tab(self) -> QWidget:
        """Create metrics visualization tab."""
        metrics_tab = QWidget()
        layout = QVBoxLayout(metrics_tab)
        
        # Performance metrics
        self.performance_canvas = None
        layout.addWidget(QLabel("Performance Metrics"))
        
        # Real-time updates
        self.metrics_timer = QTimer()
        self.metrics_timer.timeout.connect(self._update_metrics)
        self.metrics_timer.start(1000)  # Update every second
        
        return metrics_tab

    def _suggest_code(self):
        """Get AI-powered code suggestions."""
        if not self.selected_item:
            QMessageBox.warning(self, "Error", "Please select a node first")
            return
            
        context = self._get_node_context(self.selected_item)
        suggestion = self.ai.suggest_code(context)
        
        reply = QMessageBox.question(
            self, "Code Suggestion",
            f"AI suggests:\n\n{suggestion}\n\nApply suggestion?",
            QMessageBox.Yes | QMessageBox.No
        )
        
        if reply == QMessageBox.Yes:
            self.selected_item.data(0)["value"] = suggestion
            self._pending_updates.add(self.selected_item)
            self._render_timer.start(16)

    def _analyze_complexity(self):
        """Analyze and visualize code complexity."""
        # Collect nodes and connections
        nodes = []
        connections = []
        
        for node in self.nodes:
            data = node.data(0)
            nodes.append({
                "type": data["type"],
                "value": data["value"]
            })
            
        for line in self.lines:
            start, end = line.data(0)
            connections.append({
                "source": self.nodes.index(start),
                "target": self.nodes.index(end)
            })
            
        # Analyze complexity
        metrics = self.ai.analyze_complexity(nodes, connections)
        
        # Update visualization
        if self.complexity_canvas:
            self.visualization_panel.removeTab(
                self.visualization_panel.indexOf(self.complexity_canvas)
            )
            
        self.complexity_canvas = self.visualizer.create_complexity_visualization(metrics)
        self.visualization_panel.addTab(self.complexity_canvas, "Complexity")
        
        # Display metrics
        text = "Code Complexity Metrics:\n\n"
        text += f"Cyclomatic Complexity: {metrics['cyclomatic_complexity']:.2f}\n"
        text += f"Average Path Length: {metrics['average_path_length']:.2f}\n"
        text += f"Clustering Coefficient: {metrics['clustering_coefficient']:.2f}\n"
        
        self.metrics_display.setText(text)
        self.visualization_panel.show()

    def _optimize_layout(self):
        """Optimize node layout using force-directed graph layout."""
        # Create networkx graph
        G = nx.DiGraph()
        
        # Add nodes
        for i, node in enumerate(self.nodes):
            G.add_node(i, pos=(node.pos().x(), node.pos().y()))
            
        # Add edges
        for line in self.lines:
            start, end = line.data(0)
            G.add_edge(self.nodes.index(start), self.nodes.index(end))
            
        # Calculate layout
        pos = nx.spring_layout(G, k=1, iterations=50)
        
        # Animate nodes to new positions
        for i, node in enumerate(self.nodes):
            new_pos = pos[i]
            animation = QPropertyAnimation(node, b"pos")
            animation.setDuration(1000)
            animation.setEasingCurve(QEasingCurve.InOutCubic)
            animation.setStartValue(node.pos())
            animation.setEndValue(QPointF(new_pos[0], new_pos[1]))
            animation.start()
            
            # Add morphing effect during transition
            if hasattr(node, 'morphing_effect'):
                node.morphing_effect.set_progress(0.0)
                morph_animation = QPropertyAnimation(node.morphing_effect, b"progress")
                morph_animation.setDuration(500)
                morph_animation.setEasingCurve(QEasingCurve.InOutCubic)
                morph_animation.setStartValue(0.0)
                morph_animation.setEndValue(1.0)
                morph_animation.start()
            
            self.visualizer.animations.append(animation)

    def _get_node_context(self, node) -> str:
        """Get context for AI code suggestion."""
        context = []
        
        # Add parent nodes
        for n in self.nodes:
            if node in n.data(0)["connections"]:
                context.append(n.data(0)["value"])
                
        # Add connected nodes
        for conn in node.data(0)["connections"]:
            context.append(conn.data(0)["value"])
            
        return "\n".join(context)

    def _update_metrics(self):
        """Update real-time performance metrics."""
        if not self.performance_canvas:
            return
            
        # Collect metrics
        metrics = {
            "nodes": len(self.nodes),
            "connections": len(self.lines),
            "render_time": self._last_render_time,
            "memory_usage": self._get_memory_usage()
        }
        
        # Update visualization
        self.performance_canvas.figure.clear()
        ax = self.performance_canvas.figure.add_subplot(111)
        ax.bar(metrics.keys(), metrics.values(), color=[c.name() for c in self.visualizer.colors])
        ax.set_title("Real-time Performance Metrics")
        self.performance_canvas.draw()

    def _get_memory_usage(self) -> float:
        """Get current memory usage."""
        import psutil
        process = psutil.Process()
        return process.memory_info().rss / 1024 / 1024  # MB

    def _setup_optimizations(self):
        """Setup performance optimizations."""
        self._node_cache = {}
        self._line_cache = {}
        self._render_timer = QTimer()
        self._render_timer.setSingleShot(True)
        self._render_timer.timeout.connect(self._optimized_render)
        self._pending_updates = set()

    def _setup_ui(self):
        """Initialize the user interface with optimized components."""
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QHBoxLayout(central_widget)

        # Scene and View
        self.scene = QGraphicsScene()
        self.scene.setBackgroundBrush(QColor(240, 240, 240))
        self.view = QGraphicsView(self.scene)
        self.view.setSceneRect(-400, -400, 800, 800)  # Centered spiral
        self.view.setRenderHint(QPainter.Antialiasing)
        self.view.setViewportUpdateMode(QGraphicsView.FullViewportUpdate)
        self.view.setHorizontalScrollBarPolicy(Qt.ScrollBarAlwaysOn)
        self.view.setVerticalScrollBarPolicy(Qt.ScrollBarAlwaysOn)
        self.view.setDragMode(QGraphicsView.ScrollHandDrag)
        main_layout.addWidget(self.view)

        # Right Panel
        right_panel = QWidget()
        right_layout = QVBoxLayout(right_panel)
        main_layout.addWidget(right_panel)

        # Toolbar
        toolbar = QToolBar("Tools")
        self.addToolBar(Qt.TopToolBarArea, toolbar)
        toolbar.addAction("Tetrahedral (Stmt)", lambda: self.add_node("Tetrahedral"))
        toolbar.addAction("Hexagonal (Loop)", lambda: self.add_node("Hexagonal"))
        toolbar.addAction("Pentagonal (If)", lambda: self.add_node("Pentagonal"))
        toolbar.addAction("Fractal (Func)", lambda: self.add_node("Fractal"))
        toolbar.addAction("Connect", self.start_connection)
        toolbar.addAction("Undo", self.undo_action)
        toolbar.addAction("Redo", self.redo_action)
        toolbar.addAction("Clear", self.clear_canvas)
        toolbar.addSeparator()
        toolbar.addAction("Save .phix", self.save_phixeo)
        toolbar.addAction("Load .phix", self.load_phixeo)
        toolbar.addAction("Export .py", self.export_python)

        # Properties
        self.prop_label = QLabel("Node Properties:")
        right_layout.addWidget(self.prop_label)
        self.prop_panel = QWidget()
        prop_layout = QFormLayout(self.prop_panel)
        self.prop_value = QLineEdit("print('Hello')")
        prop_layout.addRow("Value:", self.prop_value)
        self.prop_value.textChanged.connect(self.update_selected_node)
        right_layout.addWidget(self.prop_panel)

        # Code Preview
        self.code_label = QLabel("Generated Python Code:")
        right_layout.addWidget(self.code_label)
        self.code_text = QTextEdit()
        self.code_text.setReadOnly(True)
        right_layout.addWidget(self.code_text)

        # Output
        self.output_text = QTextEdit()
        self.output_text.setReadOnly(True)
        right_layout.addWidget(self.output_text)

        # Run Button
        run_button = QPushButton("Run Phixeo")
        run_button.clicked.connect(self.run_code)
        right_layout.addWidget(run_button)

        self.view.setMouseTracking(True)
        self.view.viewport().installEventFilter(self)

        # Setup event handling
        self.view.mousePressEvent = self.mousePressEvent
        self.view.mouseMoveEvent = self.mouseMoveEvent
        self.view.mouseReleaseEvent = self.mouseReleaseEvent
        self.view.wheelEvent = self.wheelEvent

    def _setup_enterprise_ui(self):
        """Setup enterprise UI components."""
        # Add enterprise toolbar
        enterprise_toolbar = QToolBar("Enterprise")
        self.addToolBar(Qt.TopToolBarArea, enterprise_toolbar)
        
        # Project management
        enterprise_toolbar.addAction("New Project", self._create_project)
        enterprise_toolbar.addAction("Load Project", self._load_project)
        enterprise_toolbar.addAction("Save Project", self._save_project)
        
        # Team collaboration
        enterprise_toolbar.addAction("Team", self._show_team_panel)
        
        # Analytics
        enterprise_toolbar.addAction("Analytics", self._show_analytics)
        
        # Add enterprise panel
        self.enterprise_panel = QTabWidget()
        self.enterprise_panel.addTab(self._create_team_tab(), "Team")
        self.enterprise_panel.addTab(self._create_analytics_tab(), "Analytics")
        self.enterprise_panel.hide()
        
        # Add to main layout
        self.main_layout.addWidget(self.enterprise_panel)

    def _create_team_tab(self) -> QWidget:
        """Create team collaboration tab."""
        team_tab = QWidget()
        layout = QVBoxLayout(team_tab)
        
        # Team member list
        self.team_list = QListWidget()
        layout.addWidget(QLabel("Team Members"))
        layout.addWidget(self.team_list)
        
        # Add member button
        add_member_btn = QPushButton("Add Team Member")
        add_member_btn.clicked.connect(self._add_team_member)
        layout.addWidget(add_member_btn)
        
        return team_tab

    def _create_analytics_tab(self) -> QWidget:
        """Create analytics tab."""
        analytics_tab = QWidget()
        layout = QVBoxLayout(analytics_tab)
        
        # Metrics display
        self.metrics_display = QTextEdit()
        self.metrics_display.setReadOnly(True)
        layout.addWidget(self.metrics_display)
        
        # Refresh button
        refresh_btn = QPushButton("Refresh Analytics")
        refresh_btn.clicked.connect(self._refresh_analytics)
        layout.addWidget(refresh_btn)
        
        return analytics_tab

    def _create_project(self):
        """Create new enterprise project."""
        name, ok = QInputDialog.getText(self, "New Project", "Enter project name:")
        if ok and name:
            self.current_project_id = self.enterprise.create_project(
                name=name,
                owner_id=1,  # Replace with actual user ID
                team_id=1    # Replace with actual team ID
            )
            self.statusBar().showMessage(f"Created project: {name}")

    def _save_project(self):
        """Save current project state."""
        if not self.current_project_id:
            QMessageBox.warning(self, "Error", "No project selected")
            return
            
        # Collect current state
        nodes = []
        connections = []
        
        for node in self.nodes:
            data = node.data(0)
            nodes.append({
                "type": data["type"],
                "value": data["value"],
                "x": node.pos().x(),
                "y": node.pos().y()
            })
            
        for line in self.lines:
            start, end = line.data(0)
            connections.append({
                "source": self.nodes.index(start),
                "target": self.nodes.index(end)
            })
            
        # Save to database
        self.enterprise.save_project_state(
            self.current_project_id,
            nodes,
            connections
        )
        
        # Record analytics
        self.enterprise.collaboration_queue.put({
            "project_id": self.current_project_id,
            "node_count": len(nodes),
            "connection_count": len(connections),
            "render_time": self._last_render_time
        })
        
        self.statusBar().showMessage("Project saved")

    def _show_analytics(self):
        """Show project analytics."""
        if not self.current_project_id:
            QMessageBox.warning(self, "Error", "No project selected")
            return
            
        analytics = self.enterprise.get_project_analytics(self.current_project_id)
        
        # Format analytics display
        text = "Current Metrics:\n"
        for metric, value in analytics["current_metrics"].items():
            text += f"{metric}: {value:.2f}\n"
            
        text += "\nTrends:\n"
        for metric, avg in analytics["trends"].items():
            text += f"{metric}: {avg:.2f} (avg)\n"
            
        self.metrics_display.setText(text)
        self.enterprise_panel.show()
        self.enterprise_panel.setCurrentIndex(1)  # Switch to analytics tab

        # Add wave effect to metrics display
        self.metrics_display.setGraphicsEffect(self.effects['wave'])
        
        # Add fractal background
        self.visualization_panel.setGraphicsEffect(self.effects['fractal'])
        
        # Add spiral effect to complexity graph
        if self.complexity_canvas:
            self.complexity_canvas.setGraphicsEffect(self.effects['spiral'])

    def add_node(self, node_type):
        n = len(self.nodes)
        theta = n * self.golden_angle
        r = self.base_a * (self.phi ** (n / 2))
        x, y = r * cos(theta), r * sin(theta)
        size = self.constants[node_type] * 2
        color = {"Tetrahedral": "#FF5555", "Hexagonal": "#5555FF", "Pentagonal": "#55FF55", "Fractal": "#AA55FF"}[node_type]
        
        path = self._create_polygon(node_type, size)
        item = self.scene.addPath(path, QPen(Qt.black), QColor(color))
        item.setPos(x - size / 2, y - size / 2)
        item.setFlag(item.ItemIsMovable)
        item.setFlag(item.ItemIsSelectable)
        item.setData(0, {"type": node_type, "value": self.prop_value.text(), "connections": []})
        self.nodes.append(item)
        self.action_history.append(("add_node", item))
        self.redo_history.clear()
        self.update_code_preview()
        self._pending_updates.add(item)
        
        # Add visual effects
        item.setGraphicsEffect(self.effects['glow'])
        
        # Create morphing animation
        start_shape = self._create_polygon(node_type, size * 0.8)
        end_shape = self._create_polygon(node_type, size)
        morphing = MorphingEffect(start_shape, end_shape)
        item.morphing_effect = morphing
        
        # Animate morphing
        animation = QPropertyAnimation(morphing, b"progress")
        animation.setDuration(500)
        animation.setEasingCurve(QEasingCurve.OutBack)
        animation.setStartValue(0.0)
        animation.setEndValue(1.0)
        animation.start()

    def _create_polygon(self, node_type, size):
        path = QPainterPath()
        if node_type == "Tetrahedral":
            h = size * sqrt(3) / 2
            path.moveTo(0, -h / 2); path.lineTo(-size / 2, h / 2); path.lineTo(size / 2, h / 2); path.closeSubpath()
        elif node_type == "Hexagonal":
            for i in range(6):
                angle = pi * i / 3
                path.lineTo(size * cos(angle), size * sin(angle)) if i > 0 else path.moveTo(size * cos(angle), size * sin(angle))
            path.closeSubpath()
        elif node_type == "Pentagonal":
            for i in range(5):
                angle = 2 * pi * i / 5
                path.lineTo(size * cos(angle), size * sin(angle)) if i > 0 else path.moveTo(size * cos(angle), size * sin(angle))
            path.closeSubpath()
        elif node_type == "Fractal":
            for i in range(8):  # Octagon as spiral proxy
                angle = pi * i / 4
                path.lineTo(size * cos(angle), size * sin(angle)) if i > 0 else path.moveTo(size * cos(angle), size * sin(angle))
            path.closeSubpath()
        return path

    def start_connection(self):
        self.connecting = not self.connecting
        self.statusBar().showMessage("Connection mode: Click first node" if self.connecting else "")

    def eventFilter(self, obj, event):
        if obj is self.view.viewport() and event.type() == QEvent.MouseButtonPress:
            pos = self.view.mapToScene(event.pos())
            item = self.scene.itemAt(pos, self.view.transform())
            if self.connecting and item and isinstance(item, QGraphicsPathItem):
                if not self.start_item:
                    self.start_item = item
                    self.statusBar().showMessage("Selected first node - click second")
                elif item != self.start_item:
                    line = self.scene.addLine(self.start_item.pos().x() + self.constants[item.data(0)["type"]] * 2 / 2, 
                                             self.start_item.pos().y() + self.constants[item.data(0)["type"]] * 2 / 2, 
                                             item.pos().x() + self.constants[item.data(0)["type"]] * 2 / 2, 
                                             item.pos().y() + self.constants[item.data(0)["type"]] * 2 / 2, 
                                             QPen(Qt.black, 2))
                    line.setData(0, [self.start_item, item])
                    self.lines.append(line)
                    self.start_item.data(0)["connections"].append(item)
                    self.action_history.append(("add_connection", line))
                    self.redo_history.clear()
                    self.connecting = False
                    self.start_item = None
                    self.statusBar().clearMessage()
                    self.update_code_preview()
            elif item and isinstance(item, QGraphicsPathItem):
                self.selected_item = item
                for i in self.scene.items():
                    i.setPen(QPen(Qt.black, 2))
                item.setPen(QPen(Qt.yellow, 3))
                self.prop_value.setText(item.data(0)["value"])
                self.drag_offset = pos - item.pos()

        elif obj is self.view.viewport() and event.type() == QEvent.MouseMove and self.selected_item:
            pos = self.view.mapToScene(event.pos())
            self.selected_item.setPos(pos - self.drag_offset)
            self.update_lines()
            self.update_code_preview()

        elif obj is self.view.viewport() and event.type() == QEvent.MouseButtonRelease:
            self.selected_item = None
            self.drag_offset = None

        return super().eventFilter(obj, event)

    def update_lines(self):
        for line in self.lines:
            start_item, end_item = line.data(0)
            start_center = start_item.pos() + QPointF(self.constants[start_item.data(0)["type"]] * 2 / 2, self.constants[start_item.data(0)["type"]] * 2 / 2)
            end_center = end_item.pos() + QPointF(self.constants[end_item.data(0)["type"]] * 2 / 2, self.constants[end_item.data(0)["type"]] * 2 / 2)
            line.setLine(start_center.x(), start_center.y(), end_center.x(), end_center.y())

    def undo_action(self):
        if not self.action_history:
            QMessageBox.information(self, "Undo", "Nothing to undo!")
            return
        action_type, item = self.action_history.pop()
        self.redo_history.append((action_type, item))
        if action_type == "add_node":
            self.scene.removeItem(item)
            self.nodes.remove(item)
        elif action_type == "add_connection":
            self.scene.removeItem(item)
            self.lines.remove(item)
            item.data(0)[0].data(0)["connections"].remove(item.data(0)[1])
        self.update_code_preview()

    def redo_action(self):
        if not self.redo_history:
            QMessageBox.information(self, "Redo", "Nothing to redo!")
            return
        action_type, item = self.redo_history.pop()
        self.action_history.append((action_type, item))
        if action_type == "add_node":
            self.scene.addItem(item)
            self.nodes.append(item)
        elif action_type == "add_connection":
            self.scene.addItem(item)
            self.lines.append(item)
            item.data(0)[0].data(0)["connections"].append(item.data(0)[1])
        self.update_code_preview()

    def clear_canvas(self):
        self.scene.clear()
        self.nodes = []
        self.lines = []
        self.action_history = []
        self.redo_history = []
        self.update_code_preview()

    def update_selected_node(self):
        if self.selected_item:
            self.selected_item.data(0)["value"] = self.prop_value.text()
            self.update_code_preview()

    def update_code_preview(self):
        code = ""
        for node in self.nodes:
            data = node.data(0)
            indent = "    " * len(data["connections"])
            if data["type"] == "Tetrahedral":
                code += f"{indent}{data['value']}\n"
            elif data["type"] == "Hexagonal":
                code += f"{indent}for {data['value']}:\n"
                for conn in data["connections"]:
                    code += f"{indent}    {conn.data(0)['value']}\n"
            elif data["type"] == "Pentagonal":
                code += f"{indent}if {data['value']}:\n"
                for conn in data["connections"]:
                    code += f"{indent}    {conn.data(0)['value']}\n"
            elif data["type"] == "Fractal":
                code += f"{indent}def {data['value']}:\n"
                for conn in data["connections"]:
                    code += f"{indent}    {conn.data(0)['value']}\n"
        self.code_text.setText(code)

    def run_code(self):
        from phixeo_runtime import PhixeoRuntime  # Import runtime here to avoid circular dependency
        runtime = PhixeoRuntime(self.nodes, self.lines)
        output = runtime.execute()
        self.output_text.setText(output)

    def save_phixeo(self):
        filename, _ = QFileDialog.getSaveFileName(self, "Save Phixeo", "", "Phixeo Files (*.phix)")
        if filename:
            data = [{"type": n.data(0)["type"], "x": n.pos().x(), "y": n.pos().y(), "value": n.data(0)["value"], 
                     "connections": [self.nodes.index(c) for c in n.data(0)["connections"]]} for n in self.nodes]
            with open(filename, "w") as f:
                json.dump(data, f)

    def load_phixeo(self):
        filename, _ = QFileDialog.getOpenFileName(self, "Load Phixeo", "", "Phixeo Files (*.phix)")
        if filename:
            self.clear_canvas()
            with open(filename, "r") as f:
                data = json.load(f)
            nodes = []
            for item in data:
                path = self._create_polygon(item["type"], self.constants[item["type"]] * 2)
                color = {"Tetrahedral": "#FF5555", "Hexagonal": "#5555FF", "Pentagonal": "#55FF55", "Fractal": "#AA55FF"}[item["type"]]
                node = self.scene.addPath(path, QPen(Qt.black), QColor(color))
                node.setPos(item["x"], item["y"])
                node.setFlag(node.ItemIsMovable)
                node.setFlag(node.ItemIsSelectable)
                node.setData(0, {"type": item["type"], "value": item["value"], "connections": []})
                nodes.append(node)
            for i, item in enumerate(data):
                for conn_idx in item["connections"]:
                    line = self.scene.addLine(nodes[i].pos().x() + self.constants[item["type"]] * 2 / 2, 
                                              nodes[i].pos().y() + self.constants[item["type"]] * 2 / 2, 
                                              nodes[conn_idx].pos().x() + self.constants[nodes[conn_idx].data(0)["type"]] * 2 / 2, 
                                              nodes[conn_idx].pos().y() + self.constants[nodes[conn_idx].data(0)["type"]] * 2 / 2, 
                                              QPen(Qt.black, 2))
                    line.setData(0, [nodes[i], nodes[conn_idx]])
                    self.lines.append(line)
                    nodes[i].data(0)["connections"].append(nodes[conn_idx])
            self.nodes = nodes
            self.update_code_preview()

    def export_python(self):
        filename, _ = QFileDialog.getSaveFileName(self, "Export Python", "", "Python Files (*.py)")
        if filename:
            with open(filename, "w") as f:
                f.write(self.code_text.toPlainText())

    def mousePressEvent(self, event):
        """Handle mouse press with optimized selection."""
        pos = self.view.mapToScene(event.pos())
        item = self.scene.itemAt(pos, self.view.transform())
        
        if item and isinstance(item, QGraphicsPolygonItem):
            self.selected_item = item
            self.dragging = True
            self.last_pos = pos
        else:
            self.selected_item = None
            self.dragging = False

    def mouseMoveEvent(self, event):
        """Handle mouse move with optimized dragging."""
        if self.dragging and self.selected_item:
            pos = self.view.mapToScene(event.pos())
            delta = pos - self.last_pos
            self.selected_item.setPos(pos - delta)
            self.last_pos = pos
            self._pending_updates.add(self.selected_item)
            self._render_timer.start(16)  # ~60 FPS

    def mouseReleaseEvent(self, event):
        """Handle mouse release with optimized cleanup."""
        self.dragging = False
        self.selected_item = None
        self.last_pos = None

    def wheelEvent(self, event):
        """Handle wheel events with optimized zooming."""
        factor = 1.15
        if event.angleDelta().y() < 0:
            factor = 1.0 / factor
            
        self.zoom_factor *= factor
        self.view.scale(factor, factor)

    def contextMenuEvent(self, event):
        """Handle context menu with optimized menu creation."""
        pos = self.view.mapToScene(event.pos())
        item = self.scene.itemAt(pos, self.view.transform())
        
        if item and isinstance(item, QGraphicsPolygonItem):
            menu = QMenu()
            add_conn = menu.addAction("Add Connection")
            edit_node = menu.addAction("Edit Node")
            delete_node = menu.addAction("Delete Node")
            
            action = menu.exec_(event.globalPos())
            if action == add_conn:
                self._add_connection(item)
            elif action == edit_node:
                self._edit_node(item)
            elif action == delete_node:
                self._delete_node(item)

    def _add_connection(self, source_node):
        """Add connection with optimized validation."""
        target_node, ok = QInputDialog.getItem(
            self, "Select Target", "Choose target node:",
            [n.data(0)["value"] for n in self.nodes if n != source_node],
            0, False
        )
        
        if ok and target_node:
            target = next(n for n in self.nodes if n.data(0)["value"] == target_node)
            source_node.data(0)["connections"].append(target)
            self._pending_updates.add(source_node)
            self._render_timer.start(16)

    def _edit_node(self, node):
        """Edit node with optimized validation."""
        text, ok = QInputDialog.getText(
            self, "Edit Node", "Enter new value:",
            text=node.data(0)["value"]
        )
        
        if ok and text:
            node.data(0)["value"] = text
            self._pending_updates.add(node)
            self._render_timer.start(16)

    def _delete_node(self, node):
        """Delete node with optimized cleanup."""
        reply = QMessageBox.question(
            self, "Delete Node",
            "Are you sure you want to delete this node?",
            QMessageBox.Yes | QMessageBox.No
        )
        
        if reply == QMessageBox.Yes:
            # Remove connections
            for n in self.nodes:
                if "connections" in n.data(0):
                    n.data(0)["connections"] = [
                        conn for conn in n.data(0)["connections"]
                        if conn != node
                    ]
            
            # Remove node and its visuals
            self.scene.removeItem(node)
            self.nodes.remove(node)
            self._pending_updates.update(self.nodes)
            self._render_timer.start(16)

    def _optimized_render(self):
        """Perform optimized rendering of pending updates."""
        for node in self._pending_updates:
            self._update_node_visuals(node)
        self._pending_updates.clear()

    def _update_node_visuals(self, node):
        """Update node visuals with optimized rendering."""
        data = node.data(0)
        if not data:
            return
            
        # Update shape
        points = self._get_shape_points(data["type"])
        node.setPolygon(QPolygonF(points))
        
        # Update connections
        self._update_connections(node)

    def _update_connections(self, node):
        """Update connections with optimized rendering."""
        data = node.data(0)
        if not data or "connections" not in data:
            return
            
        for conn in data["connections"]:
            if (node, conn) in self._line_cache:
                line = self._line_cache[(node, conn)]
            else:
                line = QGraphicsLineItem()
                self._line_cache[(node, conn)] = line
                self.scene.addItem(line)
                
            # Update line position
            start = node.pos() + QPointF(0, 0)
            end = conn.pos() + QPointF(0, 0)
            line.setLine(start.x(), start.y(), end.x(), end.y())

    def _setup_effects(self):
        """Setup visual effects and animations."""
        # Apply effects to scene
        self.scene.setBackgroundBrush(QColor(30, 30, 30))
        self.view.setRenderHint(QPainter.Antialiasing)
        
        # Create animation timer
        self.animation_timer = QTimer()
        self.animation_timer.timeout.connect(self._update_animations)
        self.animation_timer.start(16)  # ~60 FPS

    def _update_animations(self):
        """Update all animations."""
        # Update wave effect
        self.effects['wave'].update(0.016)
        
        # Update spiral effect
        self.effects['spiral'].update(0.016)
        
        # Update particle effects
        for line in self.lines:
            if hasattr(line, 'particle_effect'):
                line.particle_effect.update(0.016)
                
        # Update morphing effects
        for node in self.nodes:
            if hasattr(node, 'morphing_effect'):
                node.morphing_effect.update(0.016)
