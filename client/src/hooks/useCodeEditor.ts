import { useState } from 'react';

interface FileTab {
  id: string;
  title: string;
  content: string;
  language: string;
}

export const useCodeEditor = () => {
  const [activeFile, setActiveFile] = useState<string>('visual_editor.py');
  const [files, setFiles] = useState<FileTab[]>([
    {
      id: 'visual_editor.py',
      title: 'visual_editor.py',
      language: 'python',
      content: `import phixeo_parser as parser
from math import pi, sqrt, cos, sin

class VisualEditor:
    def __init__(self):
        self.phi = (1 + sqrt(5)) / 2  # Golden ratio
        self.nodes = []
        self.constants = {
            "Tetrahedral": (pi**2 + self.phi * sqrt(5)) / 2,  # ~7.416
            "Hexagonal": pi + (2 * sqrt(3)) / self.phi,     # ~4.373
            "Pentagonal": (pi + self.phi + sqrt(5)) / 3,     # ~2.327
            "Fractal": pi * self.phi**2 + sqrt(2)         # ~9.737
        }
        self.golden_angle = 2.399  # ~137.5 degrees in radians`
    },
    {
      id: 'system_monitor.py',
      title: 'system_monitor.py',
      language: 'python',
      content: `import psutil
import GPUtil
from datetime import datetime

class SystemMonitor:
    """System monitoring and resource management."""
    
    def __init__(self):
        self.metrics = {}
        self.alerts = []
        self._setup_monitoring()
        
    def _setup_monitoring(self):
        """Setup system monitoring."""
        self.monitor_timer = QTimer()
        self.monitor_timer.timeout.connect(self._update_metrics)
        self.monitor_timer.start(1000)  # Update every second
        
    def _update_metrics(self):
        """Update system metrics."""
        # CPU metrics
        self.metrics["cpu"] = {
            "usage": psutil.cpu_percent(),
            "cores": psutil.cpu_count(),
            "frequency": psutil.cpu_freq().current
        }`
    },
    {
      id: 'license_manager.py',
      title: 'license_manager.py',
      language: 'python',
      content: `import hashlib
import jwt
import datetime
from cryptography.fernet import Fernet

class LicenseManager:
    """Manages Phixeo licensing and verification."""
    
    def __init__(self, secret_key):
        self.secret_key = secret_key
        self.fernet = Fernet(secret_key)
        
    def generate_license(self, user_id, features, expiration_days=365):
        """Generate a new license for a user."""
        payload = {
            'user_id': user_id,
            'features': features,
            'iat': datetime.datetime.utcnow(),
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=expiration_days)
        }
        
        token = jwt.encode(payload, self.secret_key, algorithm='HS256')
        return self.fernet.encrypt(token.encode()).decode()`
    }
  ]);

  const openFile = (fileId: string) => {
    if (files.some(file => file.id === fileId)) {
      setActiveFile(fileId);
    }
  };

  const updateFileContent = (fileId: string, newContent: string) => {
    setFiles(files.map(file => 
      file.id === fileId ? { ...file, content: newContent } : file
    ));
  };

  const addNewFile = (fileName: string, language: string = 'python') => {
    const newFile: FileTab = {
      id: fileName,
      title: fileName,
      content: '',
      language
    };
    
    setFiles([...files, newFile]);
    setActiveFile(fileName);
  };

  const closeFile = (fileId: string) => {
    const fileIndex = files.findIndex(file => file.id === fileId);
    if (fileIndex === -1) return;
    
    const newFiles = files.filter(file => file.id !== fileId);
    setFiles(newFiles);
    
    // If we're closing the active file, switch to another file
    if (activeFile === fileId && newFiles.length > 0) {
      setActiveFile(newFiles[0].id);
    }
  };

  const getActiveFileContent = () => {
    const file = files.find(file => file.id === activeFile);
    return file ? file.content : '';
  };

  return {
    files,
    activeFile,
    openFile,
    updateFileContent,
    addNewFile,
    closeFile,
    getActiveFileContent
  };
};
