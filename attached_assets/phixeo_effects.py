from PyQt5.QtWidgets import QGraphicsEffect
from PyQt5.QtGui import QPainter, QColor, QPainterPath, QLinearGradient, QRadialGradient
from PyQt5.QtCore import Qt, QRectF, QPointF, QPropertyAnimation, QEasingCurve
from math import sin, cos, pi, sqrt
import numpy as np

class GlowEffect(QGraphicsEffect):
    """Beautiful glow effect for nodes."""
    
    def __init__(self, color: QColor, radius: float = 10.0):
        super().__init__()
        self.color = color
        self.radius = radius
        self.opacity = 0.8
        
    def draw(self, painter: QPainter):
        """Draw the glow effect."""
        if not self.sourcePixmap():
            return
            
        # Create gradient for glow
        gradient = QRadialGradient(
            self.sourcePixmap().rect().center(),
            self.radius
        )
        gradient.setColorAt(0, self.color)
        gradient.setColorAt(1, QColor(0, 0, 0, 0))
        
        # Draw glow
        painter.setRenderHint(QPainter.Antialiasing)
        painter.setPen(Qt.NoPen)
        painter.setBrush(gradient)
        painter.drawEllipse(self.sourcePixmap().rect(), self.radius, self.radius)
        
        # Draw source
        painter.drawPixmap(0, 0, self.sourcePixmap())

class ParticleEffect(QGraphicsEffect):
    """Particle system effect for connections."""
    
    def __init__(self, color: QColor, particle_count: int = 20):
        super().__init__()
        self.color = color
        self.particle_count = particle_count
        self.particles = []
        self._init_particles()
        
    def _init_particles(self):
        """Initialize particle system."""
        for _ in range(self.particle_count):
            self.particles.append({
                'pos': QPointF(0, 0),
                'velocity': QPointF(
                    (np.random.random() - 0.5) * 2,
                    (np.random.random() - 0.5) * 2
                ),
                'life': 1.0
            })
            
    def draw(self, painter: QPainter):
        """Draw particle effect."""
        if not self.sourcePixmap():
            return
            
        # Update particles
        for particle in self.particles:
            particle['pos'] += particle['velocity']
            particle['life'] -= 0.01
            
            if particle['life'] <= 0:
                particle['pos'] = QPointF(0, 0)
                particle['life'] = 1.0
                
        # Draw particles
        painter.setRenderHint(QPainter.Antialiasing)
        for particle in self.particles:
            alpha = int(particle['life'] * 255)
            color = QColor(self.color)
            color.setAlpha(alpha)
            painter.setPen(Qt.NoPen)
            painter.setBrush(color)
            painter.drawEllipse(particle['pos'], 2, 2)
            
        # Draw source
        painter.drawPixmap(0, 0, self.sourcePixmap())

class MorphingEffect(QGraphicsEffect):
    """Morphing effect for node transitions."""
    
    def __init__(self, start_shape: QPainterPath, end_shape: QPainterPath):
        super().__init__()
        self.start_shape = start_shape
        self.end_shape = end_shape
        self.progress = 0.0
        
    def set_progress(self, progress: float):
        """Set morphing progress (0.0 to 1.0)."""
        self.progress = max(0.0, min(1.0, progress))
        self.update()
        
    def draw(self, painter: QPainter):
        """Draw morphing effect."""
        if not self.sourcePixmap():
            return
            
        # Interpolate between shapes
        current_shape = QPainterPath()
        for i in range(100):
            t = i / 100.0
            start_point = self.start_shape.pointAtPercent(t)
            end_point = self.end_shape.pointAtPercent(t)
            
            current_point = QPointF(
                start_point.x() + (end_point.x() - start_point.x()) * self.progress,
                start_point.y() + (end_point.y() - start_point.y()) * self.progress
            )
            
            if i == 0:
                current_shape.moveTo(current_point)
            else:
                current_shape.lineTo(current_point)
                
        # Draw shape
        painter.setRenderHint(QPainter.Antialiasing)
        painter.setPen(QPen(Qt.black, 2))
        painter.setBrush(self.sourcePixmap())
        painter.drawPath(current_shape)

class WaveEffect(QGraphicsEffect):
    """Wave animation effect for the canvas."""
    
    def __init__(self, amplitude: float = 10.0, frequency: float = 0.1):
        super().__init__()
        self.amplitude = amplitude
        self.frequency = frequency
        self.time = 0.0
        
    def update(self, delta: float = 0.016):
        """Update wave animation."""
        self.time += delta
        super().update()
        
    def draw(self, painter: QPainter):
        """Draw wave effect."""
        if not self.sourcePixmap():
            return
            
        # Create wave distortion
        pixmap = self.sourcePixmap()
        width = pixmap.width()
        height = pixmap.height()
        
        # Apply wave transformation
        painter.setRenderHint(QPainter.Antialiasing)
        for y in range(height):
            offset = sin(y * self.frequency + self.time) * self.amplitude
            painter.drawPixmap(
                offset, y,
                pixmap.copy(0, y, width, 1)
            )

class GoldenSpiralEffect(QGraphicsEffect):
    """Golden spiral animation effect."""
    
    def __init__(self, color: QColor, size: float = 100.0):
        super().__init__()
        self.color = color
        self.size = size
        self.phi = (1 + sqrt(5)) / 2
        self.angle = 0.0
        
    def update(self, delta: float = 0.016):
        """Update spiral animation."""
        self.angle += delta
        super().update()
        
    def draw(self, painter: QPainter):
        """Draw golden spiral effect."""
        if not self.sourcePixmap():
            return
            
        # Create spiral path
        path = QPainterPath()
        points = []
        
        for i in range(100):
            t = i / 100.0
            r = self.size * (self.phi ** (t * 2))
            theta = t * 4 * pi + self.angle
            
            x = r * cos(theta)
            y = r * sin(theta)
            points.append(QPointF(x, y))
            
        # Draw spiral
        painter.setRenderHint(QPainter.Antialiasing)
        painter.setPen(QPen(self.color, 2))
        
        for i in range(len(points) - 1):
            path.moveTo(points[i])
            path.lineTo(points[i + 1])
            
        painter.drawPath(path)

class FractalEffect(QGraphicsEffect):
    """Fractal pattern effect."""
    
    def __init__(self, color: QColor, depth: int = 3):
        super().__init__()
        self.color = color
        self.depth = depth
        
    def draw(self, painter: QPainter):
        """Draw fractal pattern."""
        if not self.sourcePixmap():
            return
            
        def draw_fractal(x: float, y: float, size: float, depth: int):
            if depth <= 0:
                return
                
            # Draw current level
            painter.setPen(QPen(self.color, 1))
            painter.drawRect(x, y, size, size)
            
            # Recursive fractal pattern
            new_size = size / 2
            draw_fractal(x, y, new_size, depth - 1)
            draw_fractal(x + new_size, y, new_size, depth - 1)
            draw_fractal(x, y + new_size, new_size, depth - 1)
            draw_fractal(x + new_size, y + new_size, new_size, depth - 1)
            
        # Start fractal pattern
        painter.setRenderHint(QPainter.Antialiasing)
        draw_fractal(0, 0, self.sourcePixmap().width(), self.depth)
        
        # Draw source
        painter.drawPixmap(0, 0, self.sourcePixmap()) 