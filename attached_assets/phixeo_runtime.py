import sys
from math import sqrt
from typing import List, Dict, Set, Any
from concurrent.futures import ThreadPoolExecutor
import numpy as np
from functools import lru_cache

class PhixeoRuntime:
    """Runtime for executing Phixeo nodes directly with optimized scaling."""
    
    def __init__(self, nodes, lines):
        """
        Initialize runtime with nodes and connections.

        Args:
            nodes (list): Phixeo nodes from editor.
            lines (list): Connection lines between nodes.
        """
        self.nodes = nodes
        self.lines = lines
        self.phi = (1 + sqrt(5)) / 2
        self.output = []
        self.executor = ThreadPoolExecutor(max_workers=4)
        self._node_cache = {}
        self._setup_optimized_execution()

    def _setup_optimized_execution(self):
        """Setup optimized execution environment with caching and precomputation."""
        # Precompute node positions and distances
        self._node_positions = {
            node: (node.pos().x(), node.pos().y()) 
            for node in self.nodes
        }
        
        # Create execution graph for parallel processing
        self._execution_graph = self._build_execution_graph()
        
        # Precompute common operations
        self._common_ops = {
            "print": lambda x: self.output.append(str(x)),
            "range": range,
            "__builtins__": {}
        }

    def _build_execution_graph(self) -> Dict:
        """Build optimized execution graph for parallel processing."""
        graph = {}
        for node in self.nodes:
            data = node.data(0)
            if "connections" in data:
                graph[node] = set(data["connections"])
        return graph

    @lru_cache(maxsize=1000)
    def _compute_node_distance(self, node1: Any, node2: Any) -> float:
        """Compute distance between nodes with caching."""
        x1, y1 = self._node_positions[node1]
        x2, y2 = self._node_positions[node2]
        return sqrt((x1 - x2)**2 + (y1 - y2)**2)

    def execute(self):
        """Execute nodes in spiral order with fractal optimization and parallel processing."""
        executed = set()
        futures = []
        
        # Sort nodes by spiral distance for optimal execution order
        sorted_nodes = sorted(
            self.nodes,
            key=lambda n: self._compute_node_distance(n, self.nodes[0])
        )
        
        # Parallel execution of independent nodes
        for node in sorted_nodes:
            if node not in executed and self._can_execute(node, executed):
                future = self.executor.submit(
                    self._execute_node_parallel,
                    node,
                    executed
                )
                futures.append(future)
        
        # Wait for all executions to complete
        for future in futures:
            future.result()
        
        return "\n".join(self.output)

    def _can_execute(self, node: Any, executed: Set) -> bool:
        """Check if a node can be executed based on its dependencies."""
        data = node.data(0)
        if "connections" in data:
            return all(conn in executed for conn in data["connections"])
        return True

    def _execute_node_parallel(self, node: Any, executed: Set) -> None:
        """Execute a single node with optimized memory usage."""
        data = node.data(0)
        executed.add(node)
        
        # Use cached common operations
        if data["type"] == "Tetrahedral":
            try:
                exec(data["value"], self._common_ops)
            except Exception as e:
                self.output.append(f"Error: {e}")
        elif data["type"] == "Hexagonal":
            try:
                loop_var, loop_range = data["value"].split(" in ")
                loop_range = eval(loop_range, self._common_ops)
                
                # Optimize loop execution with vectorized operations
                if isinstance(loop_range, range):
                    values = np.arange(loop_range.start, loop_range.stop, loop_range.step)
                else:
                    values = loop_range
                
                for val in values:
                    locals_dict = {
                        loop_var.strip(): val,
                        **self._common_ops
                    }
                    self.output.append(f"{data['value']}  # {val}")
                    
                    # Execute connected nodes in parallel
                    futures = []
                    for conn in data["connections"]:
                        if conn not in executed:
                            future = self.executor.submit(
                                self._execute_node_parallel,
                                conn,
                                executed
                            )
                            futures.append(future)
                    
                    for future in futures:
                        future.result()
                        
            except Exception as e:
                self.output.append(f"Error in loop: {e}")
        elif data["type"] == "Pentagonal":
            try:
                if eval(data["value"].rstrip(":"), self._common_ops):
                    self.output.append(data["value"])
                    futures = []
                    for conn in data["connections"]:
                        if conn not in executed:
                            future = self.executor.submit(
                                self._execute_node_parallel,
                                conn,
                                executed
                            )
                            futures.append(future)
                    
                    for future in futures:
                        future.result()
            except Exception as e:
                self.output.append(f"Error in if: {e}")
        elif data["type"] == "Fractal":
            # Handle fractal nodes with optimized subnode execution
            self.output.append(data["value"])
            if "subnodes" in data:
                futures = []
                for subnode in data["subnodes"]:
                    if subnode not in executed:
                        future = self.executor.submit(
                            self._execute_node_parallel,
                            subnode,
                            executed
                        )
                        futures.append(future)
                
                for future in futures:
                    future.result()
