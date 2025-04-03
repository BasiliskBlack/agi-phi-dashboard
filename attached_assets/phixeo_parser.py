import sys
from math import pi, sqrt, cos, sin, log
from PyQt5.QtWidgets import QApplication, QMainWindow, QGraphicsScene, QGraphicsView, QGraphicsPolygonItem, QGraphicsLineItem, QGraphicsTextItem
from PyQt5.QtGui import QPen, QColor, QPolygonF, QFont
from PyQt5.QtCore import Qt, QPointF
from typing import List, Dict, Optional
from concurrent.futures import ThreadPoolExecutor
import numpy as np

class PhixeoParser:
    """Parser for the Phixeo visual programming language, leveraging golden ratio and geometric constants."""
    
    def __init__(self, code_input: str):
        """
        Initialize PhixeoParser with source code.

        Args:
            code_input (str): Python code to parse into Phixeo nodes.
        """
        self.code = code_input
        self.nodes: List[Dict] = []
        self.phi = (1 + sqrt(5)) / 2  # Golden ratio
        self.constants = {
            "Tetrahedral": (pi**2 + self.phi * sqrt(5)) / 2,  # ~7.416
            "Hexagonal": pi + (2 * sqrt(3)) / self.phi,       # ~4.373
            "Pentagonal": (pi + self.phi + sqrt(5)) / 3,      # ~2.327
            "Fractal": pi * self.phi**2 + sqrt(2)             # ~9.737
        }
        self.base_a = 50.0  # Base scaling unit (pixels)
        self.golden_angle = 2.399  # ~137.5 degrees in radians
        self.executor = ThreadPoolExecutor(max_workers=4)  # Parallel processing

    def parse(self) -> List[Dict]:
        """Parse code into Phixeo nodes with spiral layout using parallel processing."""
        lines = self.code.splitlines()
        futures = []
        
        # Parallel node creation
        for n, line in enumerate(lines):
            line = line.strip()
            if not line:
                continue
            theta = n * self.golden_angle
            r = self.base_a * (self.phi ** (n / 2))
            x, y = r * cos(theta), r * sin(theta)
            
            future = self.executor.submit(self._create_node, line, x, y)
            futures.append((future, n))

        # Collect results in order
        for future, n in futures:
            node = future.result()
            if node:
                self.nodes.append(node)

        # Parallel connection processing
        self._add_connections_parallel(lines)
        return self.nodes

    def _create_node(self, line: str, x: float, y: float) -> Optional[Dict]:
        """Create a node based on code syntax."""
        if "print" in line or "=" in line:
            return {"type": "Tetrahedral", "size": self.constants["Tetrahedral"], "value": line, "x": x, "y": y, "color": "red"}
        elif "for" in line:
            return {"type": "Hexagonal", "size": self.constants["Hexagonal"], "value": line, "x": x, "y": y, "color": "blue", "connections": []}
        elif "if" in line:
            return {"type": "Pentagonal", "size": self.constants["Pentagonal"], "value": line, "x": x, "y": y, "color": "green", "connections": []}
        elif "def" in line:
            return {"type": "Fractal", "size": self.constants["Fractal"], "value": line, "x": x, "y": y, "color": "purple", "connections": []}
        return None

    def _add_connections_parallel(self, lines: List[str]) -> None:
        """Link nodes hierarchically using parallel processing."""
        futures = []
        for i, node in enumerate(self.nodes):
            if "connections" in node:
                future = self.executor.submit(self._process_connections, node, lines, i)
                futures.append(future)
        
        # Wait for all connections to be processed
        for future in futures:
            future.result()

    def _process_connections(self, node: Dict, lines: List[str], index: int) -> None:
        """Process connections for a single node."""
        indent_level = len(lines[index]) - len(lines[index].lstrip())
        if indent_level > 0:
            for j in range(index - 1, -1, -1):
                if len(lines[j]) - len(lines[j].lstrip()) < indent_level:
                    node["connections"].append(self.nodes[j])
                    break

    def optimize(self) -> List[Dict]:
        """Optimize nodes using advanced fractal nesting for redundancy reduction."""
        optimized_nodes = []
        node_groups = self._group_similar_nodes()
        
        for group in node_groups:
            if len(group) > 1:
                # Create fractal parent node
                parent = self._create_fractal_parent(group)
                optimized_nodes.append(parent)
            else:
                optimized_nodes.append(group[0])
        
        self.nodes = optimized_nodes
        return self.nodes

    def _group_similar_nodes(self) -> List[List[Dict]]:
        """Group similar nodes for fractal optimization."""
        groups = []
        current_group = []
        
        for node in self.nodes:
            if not current_group or self._nodes_are_similar(current_group[-1], node):
                current_group.append(node)
            else:
                if current_group:
                    groups.append(current_group)
                current_group = [node]
        
        if current_group:
            groups.append(current_group)
        
        return groups

    def _nodes_are_similar(self, node1: Dict, node2: Dict) -> bool:
        """Check if two nodes are similar enough to be grouped."""
        return (node1["type"] == node2["type"] and 
                node1["value"].split()[0] == node2["value"].split()[0])

    def _create_fractal_parent(self, group: List[Dict]) -> Dict:
        """Create a fractal parent node for a group of similar nodes."""
        parent = {
            "type": "Fractal",
            "size": self.constants["Fractal"],
            "value": f"group_{group[0]['type'].lower()}",
            "x": sum(n["x"] for n in group) / len(group),
            "y": sum(n["y"] for n in group) / len(group),
            "color": "purple",
            "connections": [],
            "subnodes": group
        }
        return parent

    def to_python(self) -> str:
        """Convert Phixeo nodes back to Python code."""
        code = ""
        for node in self.nodes:
            indent = "    " * len(node.get("connections", []))
            code += indent + node["value"] + "\n"
        return code.strip()

class PhixeoVisualizer(QMainWindow):
    """Interactive visualizer for Phixeo nodes with spiral layout and polygonal shapes."""
    
    def __init__(self, nodes: List[Dict]):
        """
        Initialize visualizer with parsed nodes.

        Args:
            nodes (List[Dict]): Phixeo nodes to render.
        """
        super().__init__()
        self.nodes = nodes
        self.init_ui()

    def init_ui(self) -> None:
        """Set up the UI with a zoomable, pannable graphics view."""
        self.setWindowTitle("Phixeo - Visual Programming Interface")
        self.setGeometry(100, 100, 1000, 800)

        self.scene = QGraphicsScene()
        self.view = QGraphicsView(self.scene, self)
        self.view.setGeometry(0, 0, 1000, 800)
        self.view.setRenderHint(self.view.Antialiasing)
        self.view.setDragMode(QGraphicsView.ScrollHandDrag)
        self.view.setTransformationAnchor(QGraphicsView.AnchorUnderMouse)
        self.setCentralWidget(self.view)

        self.render_nodes()
        self.render_connections()

    def render_nodes(self) -> None:
        """Render nodes as polygons with labels."""
        shape_map = {
            "Tetrahedral": self._tetrahedron_points,
            "Hexagonal": self._hexagon_points,
            "Pentagonal": self._pentagon_points,
            "Fractal": self._spiral_points
        }
        for node in self.nodes:
            size = node["size"] * 2
            x, y = node["x"], node["y"]
            color = QColor(node["color"])
            points = shape_map[node["type"]](size)

            poly = QGraphicsPolygonItem(QPolygonF([QPointF(p[0] + x, p[1] + deine y) for p in points]))
            poly.setBrush(color)
            poly.setPen(QPen(Qt.black, 1))
            self.scene.addItem(poly)

            text = QGraphicsTextItem(node["value"][:20] + "..." if len(node["value"]) > 20 else node["value"])
            text.setFont(QFont("Arial", 8))
            text.setPos(x - size / 2, y - size / 2 - 20)
            self.scene.addItem(text)

            if "subnodes" in node:
                for subnode in node["subnodes"]:
                    sub_size = subnode["size"] * 2
                    sub_x, sub_y = subnode["x"], subnode["y"]
                    sub_points = shape_map[subnode["type"]](sub_size)
                    sub_poly = QGraphicsPolygonItem(QPolygonF([QPointF(p[0] + sub_x, p[1] + sub_y) for p in sub_points]))
                    sub_poly.setBrush(QColor(subnode["color"]))
                    sub_poly.setPen(QPen(Qt.black, 1))
                    self.scene.addItem(sub_poly)
                    sub_text = QGraphicsTextItem(subnode["value"][:20] + "...")
                    sub_text.setFont(QFont("Arial", 8))
                    sub_text.setPos(sub_x - sub_size / 2, sub_y - sub_size / 2 - 20)
                    self.scene.addItem(sub_text)

    def render_connections(self) -> None:
        """Render dashed connections between nodes."""
        for node in self.nodes:
            if "connections" in node:
                for conn in node["connections"]:
                    line = QGraphicsLineItem(node["x"], node["y"], conn["x"], conn["y"])
                    line.setPen(QPen(Qt.gray, 1, Qt.DashLine))
                    self.scene.addItem(line)

    def _tetrahedron_points(self, size: float) -> List[tuple]:
        """Generate points for a tetrahedral (triangle) shape."""
        h = size * sqrt(3) / 2
        return [(0, -h / 2), (-size / 2, h / 2), (size / 2, h / 2)]

    def _hexagon_points(self, size: float) -> List[tuple]:
        """Generate points for a hexagonal shape."""
        return [(size * cos(pi * i / 3), size * sin(pi * i / 3)) for i in range(6)]

    def _pentagon_points(self, size: float) -> List[tuple]:
        """Generate points for a pentagonal shape."""
        return [(size * cos(2 * pi * i / 5), size * sin(2 * pi * i / 5)) for i in range(5)]

    def _spiral_points(self, size: float) -> List[tuple]:
        """Generate points for a fractal spiral (approximated as octagon)."""
        return [(size * cos(pi * i / 4), size * sin(pi * i / 4)) for i in range(8)]

    def wheelEvent(self, event) -> None:
        """Handle zoom via mouse wheel."""
        zoom_factor = 1.15 if event.angleDelta().y() > 0 else 0.87
        self.view.scale(zoom_factor, zoom_factor)

# Main execution
if __name__ == "__main__":
    code = """
print('Start')
for i in range(5):
    print(i)
if i > 2:
    print('Big')
def my_func():
    print('Func')
"""
    parser = PhixeoParser(code)
    nodes = parser.parse()
    optimized_nodes = parser.optimize()

    app = QApplication(sys.argv)
    window = PhixeoVisualizer(optimized_nodes)
    window.show()
    sys.exit(app.exec_())
