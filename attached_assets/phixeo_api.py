class PhixeoAPI:
    """API for integrating Phixeo into other systems."""
    
    def __init__(self):
        self.editor = PhixeoEditor()
        self.runtime = None

    def load_code(self, phixeo_file: str):
        """Load a Phixeo file into the editor."""
        self.editor.load_phixeo(phixeo_file)

    def add_node(self, node_type: str, value: str, x: float = None, y: float = None):
        """Add a node programmatically."""
        if x is None or y is None:
            self.editor.add_node(node_type)
        else:
            path = self.editor._create_polygon(node_type, self.editor.constants[node_type] * 2)
            color = {"Tetrahedral": "#FF5555", "Hexagonal": "#5555FF", "Pentagonal": "#55FF55", "Fractal": "#AA55FF"}[node_type]
            node = self.editor.scene.addPath(path, QPen(Qt.black), QColor(color))
            node.setPos(x, y)
            node.setFlag(node.ItemIsMovable)
            node.setFlag(node.ItemIsSelectable)
            node.setData(0, {"type": node_type, "value": value, "connections": []})
            self.editor.nodes.append(node)
        self.editor.update_code_preview()

    def connect_nodes(self, node1_idx: int, node2_idx: int):
        """Connect two nodes by index."""
        node1, node2 = self.editor.nodes[node1_idx], self.editor.nodes[node2_idx]
        line = self.editor.scene.addLine(node1.pos().x() + self.editor.constants[node1.data(0)["type"]] * 2 / 2, 
                                        node1.pos().y() + self.editor.constants[node1.data(0)["type"]] * 2 / 2, 
                                        node2.pos().x() + self.editor.constants[node2.data(0)["type"]] * 2 / 2, 
                                        node2.pos().y() + self.editor.constants[node2.data(0)["type"]] * 2 / 2, 
                                        QPen(Qt.black, 2))
        line.setData(0, [node1, node2])
        self.editor.lines.append(line)
        node1.data(0)["connections"].append(node2)
        self.editor.update_code_preview()

    def run(self) -> str:
        """Execute the current Phixeo program."""
        self.runtime = PhixeoRuntime(self.editor.nodes, self.editor.lines)
        return self.runtime.execute()

    def export_python(self) -> str:
        """Export current program as Python code."""
        return self.editor.code_text.toPlainText()

# Example usage
if __name__ == "__main__":
    app = QApplication(sys.argv)
    api = PhixeoAPI()
    api.add_node("Tetrahedral", "print('Hello')")
    api.add_node("Hexagonal", "i in range(3)")
    api.connect_nodes(0, 1)
    print(api.run())
    api.editor.show()
    sys.exit(app.exec_())
