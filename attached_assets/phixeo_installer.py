import os
import sys
import json
import shutil
import subprocess
import logging
import hashlib
import time
from typing import Dict, List, Any, Optional
from datetime import datetime
import psutil
import GPUtil
from cryptography.fernet import Fernet
import base64
import grp
import pwd
import socket
import platform
import uuid
import re
import tarfile
import zipfile
from pathlib import Path

class PhixeoInstaller:
    """Advanced installer for Phixeo OS with system integration and recovery options."""
    
    def __init__(self):
        self.install_config = {
            "version": "1.0.0",
            "timestamp": datetime.now().isoformat(),
            "system_info": self._get_system_info(),
            "installation_path": "/opt/phixeo",
            "backup_path": "/opt/phixeo/backups",
            "recovery_path": "/opt/phixeo/recovery",
            "log_path": "/var/log/phixeo",
            "config_path": "/etc/phixeo"
        }
        
        # Setup logging
        self._setup_logging()
        
        # Initialize encryption
        self.encryption_key = self._generate_encryption_key()
        self.fernet = Fernet(self.encryption_key)
        
    def _setup_logging(self):
        """Setup logging for installation process."""
        log_dir = os.path.dirname(self.install_config["log_path"])
        os.makedirs(log_dir, exist_ok=True)
        
        logging.basicConfig(
            filename=self.install_config["log_path"],
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
        
    def _get_system_info(self) -> Dict[str, Any]:
        """Get system information."""
        return {
            "hostname": socket.gethostname(),
            "os": platform.system(),
            "os_version": platform.version(),
            "architecture": platform.machine(),
            "processor": platform.processor(),
            "memory": psutil.virtual_memory().total,
            "disk": psutil.disk_usage('/').total,
            "gpu": self._get_gpu_info(),
            "network": self._get_network_info(),
            "uuid": str(uuid.uuid4())
        }
        
    def _get_gpu_info(self) -> Dict[str, Any]:
        """Get GPU information."""
        try:
            gpus = GPUtil.getGPUs()
            if gpus:
                return {
                    "name": gpus[0].name,
                    "memory": gpus[0].memoryTotal,
                    "driver": gpus[0].driver
                }
        except:
            pass
        return {"name": "None", "memory": 0, "driver": "None"}
        
    def _get_network_info(self) -> Dict[str, Any]:
        """Get network information."""
        interfaces = {}
        for interface, stats in psutil.net_if_stats().items():
            interfaces[interface] = {
                "speed": stats.speed,
                "mtu": stats.mtu,
                "isup": stats.isup
            }
        return interfaces
        
    def _generate_encryption_key(self) -> bytes:
        """Generate encryption key for secure storage."""
        key = Fernet.generate_key()
        return key
        
    def check_system_requirements(self) -> Dict[str, Any]:
        """Check if system meets requirements."""
        requirements = {
            "cpu": {
                "min_cores": 4,
                "min_speed": 2.0  # GHz
            },
            "memory": {
                "min_total": 8 * 1024 * 1024 * 1024,  # 8GB
                "min_free": 4 * 1024 * 1024 * 1024    # 4GB
            },
            "disk": {
                "min_total": 50 * 1024 * 1024 * 1024,  # 50GB
                "min_free": 20 * 1024 * 1024 * 1024    # 20GB
            },
            "gpu": {
                "min_memory": 4 * 1024 * 1024 * 1024   # 4GB
            }
        }
        
        results = {
            "cpu": self._check_cpu_requirements(requirements["cpu"]),
            "memory": self._check_memory_requirements(requirements["memory"]),
            "disk": self._check_disk_requirements(requirements["disk"]),
            "gpu": self._check_gpu_requirements(requirements["gpu"]),
            "dependencies": self._check_dependencies()
        }
        
        return results
        
    def _check_cpu_requirements(self, requirements: Dict[str, Any]) -> Dict[str, Any]:
        """Check CPU requirements."""
        cpu_count = psutil.cpu_count()
        cpu_freq = psutil.cpu_freq()
        
        return {
            "meets_requirements": (
                cpu_count >= requirements["min_cores"] and
                cpu_freq.max >= requirements["min_speed"] * 1000
            ),
            "cores": cpu_count,
            "speed": cpu_freq.max / 1000,
            "requirements": requirements
        }
        
    def _check_memory_requirements(self, requirements: Dict[str, Any]) -> Dict[str, Any]:
        """Check memory requirements."""
        memory = psutil.virtual_memory()
        
        return {
            "meets_requirements": (
                memory.total >= requirements["min_total"] and
                memory.available >= requirements["min_free"]
            ),
            "total": memory.total,
            "available": memory.available,
            "requirements": requirements
        }
        
    def _check_disk_requirements(self, requirements: Dict[str, Any]) -> Dict[str, Any]:
        """Check disk requirements."""
        disk = psutil.disk_usage('/')
        
        return {
            "meets_requirements": (
                disk.total >= requirements["min_total"] and
                disk.free >= requirements["min_free"]
            ),
            "total": disk.total,
            "free": disk.free,
            "requirements": requirements
        }
        
    def _check_gpu_requirements(self, requirements: Dict[str, Any]) -> Dict[str, Any]:
        """Check GPU requirements."""
        gpu_info = self._get_gpu_info()
        
        return {
            "meets_requirements": (
                gpu_info["memory"] >= requirements["min_memory"]
            ),
            "info": gpu_info,
            "requirements": requirements
        }
        
    def _check_dependencies(self) -> Dict[str, Any]:
        """Check required system dependencies."""
        required_packages = [
            "python3",
            "pip3",
            "git",
            "gcc",
            "make",
            "cmake",
            "libssl-dev",
            "libffi-dev",
            "python3-dev"
        ]
        
        results = {}
        for package in required_packages:
            try:
                subprocess.run(["which", package], check=True, capture_output=True)
                results[package] = True
            except subprocess.CalledProcessError:
                results[package] = False
                
        return {
            "meets_requirements": all(results.values()),
            "packages": results
        }
        
    def create_backup(self, paths: List[str]) -> Dict[str, Any]:
        """Create system backup."""
        backup_info = {
            "timestamp": datetime.now().isoformat(),
            "paths": paths,
            "files": [],
            "size": 0
        }
        
        backup_dir = os.path.join(
            self.install_config["backup_path"],
            f"backup_{int(time.time())}"
        )
        os.makedirs(backup_dir, exist_ok=True)
        
        for path in paths:
            if os.path.exists(path):
                if os.path.isfile(path):
                    self._backup_file(path, backup_dir, backup_info)
                else:
                    self._backup_directory(path, backup_dir, backup_info)
                    
        # Create backup archive
        archive_path = f"{backup_dir}.tar.gz"
        with tarfile.open(archive_path, "w:gz") as tar:
            tar.add(backup_dir, arcname=os.path.basename(backup_dir))
            
        # Cleanup
        shutil.rmtree(backup_dir)
        
        return backup_info
        
    def _backup_file(self, file_path: str, backup_dir: str, backup_info: Dict[str, Any]):
        """Backup single file."""
        try:
            # Calculate file hash
            file_hash = self._calculate_file_hash(file_path)
            
            # Copy file
            backup_path = os.path.join(
                backup_dir,
                os.path.relpath(file_path, "/")
            )
            os.makedirs(os.path.dirname(backup_path), exist_ok=True)
            shutil.copy2(file_path, backup_path)
            
            # Update backup info
            backup_info["files"].append({
                "path": file_path,
                "hash": file_hash,
                "size": os.path.getsize(file_path)
            })
            backup_info["size"] += os.path.getsize(file_path)
            
        except Exception as e:
            logging.error(f"Error backing up file {file_path}: {e}")
            
    def _backup_directory(self, dir_path: str, backup_dir: str, backup_info: Dict[str, Any]):
        """Backup directory recursively."""
        for root, dirs, files in os.walk(dir_path):
            for file in files:
                file_path = os.path.join(root, file)
                self._backup_file(file_path, backup_dir, backup_info)
                
    def _calculate_file_hash(self, file_path: str) -> str:
        """Calculate SHA-256 hash of file."""
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()
        
    def restore_backup(self, backup_path: str) -> Dict[str, Any]:
        """Restore system from backup."""
        restore_info = {
            "timestamp": datetime.now().isoformat(),
            "backup_path": backup_path,
            "restored_files": [],
            "errors": []
        }
        
        try:
            # Extract backup
            temp_dir = os.path.join(
                self.install_config["backup_path"],
                "temp_restore"
            )
            os.makedirs(temp_dir, exist_ok=True)
            
            with tarfile.open(backup_path, "r:gz") as tar:
                tar.extractall(temp_dir)
                
            # Restore files
            backup_dir = os.path.join(temp_dir, os.path.basename(backup_path[:-7]))
            for root, dirs, files in os.walk(backup_dir):
                for file in files:
                    backup_file = os.path.join(root, file)
                    restore_path = os.path.join(
                        "/",
                        os.path.relpath(backup_file, backup_dir)
                    )
                    
                    try:
                        os.makedirs(os.path.dirname(restore_path), exist_ok=True)
                        shutil.copy2(backup_file, restore_path)
                        restore_info["restored_files"].append(restore_path)
                    except Exception as e:
                        restore_info["errors"].append({
                            "file": restore_path,
                            "error": str(e)
                        })
                        
            # Cleanup
            shutil.rmtree(temp_dir)
            
        except Exception as e:
            restore_info["errors"].append({
                "type": "general",
                "error": str(e)
            })
            
        return restore_info
        
    def install_system(self) -> Dict[str, Any]:
        """Install Phixeo OS."""
        install_info = {
            "timestamp": datetime.now().isoformat(),
            "steps": [],
            "status": "in_progress"
        }
        
        try:
            # Check requirements
            requirements = self.check_system_requirements()
            if not all([
                requirements["cpu"]["meets_requirements"],
                requirements["memory"]["meets_requirements"],
                requirements["disk"]["meets_requirements"],
                requirements["dependencies"]["meets_requirements"]
            ]):
                raise Exception("System does not meet requirements")
                
            # Create installation directories
            self._create_installation_directories(install_info)
            
            # Install system files
            self._install_system_files(install_info)
            
            # Configure system
            self._configure_system(install_info)
            
            # Create recovery image
            self._create_recovery_image(install_info)
            
            # Update system
            self._update_system(install_info)
            
            install_info["status"] = "completed"
            
        except Exception as e:
            install_info["status"] = "failed"
            install_info["error"] = str(e)
            logging.error(f"Installation failed: {e}")
            
        return install_info
        
    def _create_installation_directories(self, install_info: Dict[str, Any]):
        """Create installation directories."""
        directories = [
            self.install_config["installation_path"],
            self.install_config["backup_path"],
            self.install_config["recovery_path"],
            self.install_config["log_path"],
            self.install_config["config_path"]
        ]
        
        for directory in directories:
            try:
                os.makedirs(directory, exist_ok=True)
                install_info["steps"].append({
                    "action": "create_directory",
                    "path": directory,
                    "status": "success"
                })
            except Exception as e:
                install_info["steps"].append({
                    "action": "create_directory",
                    "path": directory,
                    "status": "failed",
                    "error": str(e)
                })
                raise
                
    def _install_system_files(self, install_info: Dict[str, Any]):
        """Install system files."""
        # TODO: Implement system file installation
        pass
        
    def _configure_system(self, install_info: Dict[str, Any]):
        """Configure system settings."""
        # TODO: Implement system configuration
        pass
        
    def _create_recovery_image(self, install_info: Dict[str, Any]):
        """Create system recovery image."""
        # TODO: Implement recovery image creation
        pass
        
    def _update_system(self, install_info: Dict[str, Any]):
        """Update system components."""
        # TODO: Implement system updates
        pass
        
    def create_recovery_usb(self, usb_path: str) -> Dict[str, Any]:
        """Create recovery USB drive."""
        recovery_info = {
            "timestamp": datetime.now().isoformat(),
            "usb_path": usb_path,
            "steps": [],
            "status": "in_progress"
        }
        
        try:
            # Check USB drive
            if not os.path.exists(usb_path):
                raise Exception(f"USB drive not found: {usb_path}")
                
            # Format USB drive
            self._format_usb_drive(usb_path, recovery_info)
            
            # Copy recovery files
            self._copy_recovery_files(usb_path, recovery_info)
            
            # Make USB bootable
            self._make_usb_bootable(usb_path, recovery_info)
            
            recovery_info["status"] = "completed"
            
        except Exception as e:
            recovery_info["status"] = "failed"
            recovery_info["error"] = str(e)
            logging.error(f"Recovery USB creation failed: {e}")
            
        return recovery_info
        
    def _format_usb_drive(self, usb_path: str, recovery_info: Dict[str, Any]):
        """Format USB drive for recovery."""
        try:
            # Unmount USB drive
            subprocess.run(["umount", usb_path], check=True)
            
            # Format as FAT32
            subprocess.run(["mkfs.vfat", "-F", "32", usb_path], check=True)
            
            recovery_info["steps"].append({
                "action": "format_usb",
                "status": "success"
            })
        except Exception as e:
            recovery_info["steps"].append({
                "action": "format_usb",
                "status": "failed",
                "error": str(e)
            })
            raise
            
    def _copy_recovery_files(self, usb_path: str, recovery_info: Dict[str, Any]):
        """Copy recovery files to USB drive."""
        try:
            # Mount USB drive
            mount_point = "/mnt/recovery"
            os.makedirs(mount_point, exist_ok=True)
            subprocess.run(["mount", usb_path, mount_point], check=True)
            
            # Copy files
            recovery_dir = self.install_config["recovery_path"]
            for item in os.listdir(recovery_dir):
                source = os.path.join(recovery_dir, item)
                destination = os.path.join(mount_point, item)
                
                if os.path.isfile(source):
                    shutil.copy2(source, destination)
                else:
                    shutil.copytree(source, destination)
                    
            # Unmount USB drive
            subprocess.run(["umount", mount_point], check=True)
            
            recovery_info["steps"].append({
                "action": "copy_recovery_files",
                "status": "success"
            })
        except Exception as e:
            recovery_info["steps"].append({
                "action": "copy_recovery_files",
                "status": "failed",
                "error": str(e)
            })
            raise
            
    def _make_usb_bootable(self, usb_path: str, recovery_info: Dict[str, Any]):
        """Make USB drive bootable."""
        try:
            # Install bootloader
            subprocess.run(["grub-install", "--target=i386-pc", usb_path], check=True)
            
            # Create GRUB configuration
            grub_config = """
set default=0
set timeout=5

menuentry "Phixeo Recovery" {
    linux /vmlinuz root=UUID=REPLACE_UUID
    initrd /initrd.img
}
"""
            # Replace UUID
            uuid = self._get_uuid(usb_path)
            grub_config = grub_config.replace("REPLACE_UUID", uuid)
            
            # Write GRUB configuration
            config_path = os.path.join("/mnt/recovery/boot/grub/grub.cfg")
            with open(config_path, "w") as f:
                f.write(grub_config)
                
            recovery_info["steps"].append({
                "action": "make_bootable",
                "status": "success"
            })
        except Exception as e:
            recovery_info["steps"].append({
                "action": "make_bootable",
                "status": "failed",
                "error": str(e)
            })
            raise
            
    def _get_uuid(self, device: str) -> str:
        """Get UUID of device."""
        try:
            result = subprocess.run(
                ["blkid", "-s", "UUID", "-o", "value", device],
                check=True,
                capture_output=True,
                text=True
            )
            return result.stdout.strip()
        except Exception as e:
            logging.error(f"Error getting UUID: {e}")
            return ""
            
    def verify_installation(self) -> Dict[str, Any]:
        """Verify system installation."""
        verification_info = {
            "timestamp": datetime.now().isoformat(),
            "checks": [],
            "status": "in_progress"
        }
        
        try:
            # Check installation directories
            self._verify_directories(verification_info)
            
            # Check system files
            self._verify_system_files(verification_info)
            
            # Check permissions
            self._verify_permissions(verification_info)
            
            # Check system services
            self._verify_services(verification_info)
            
            # Check network connectivity
            self._verify_network(verification_info)
            
            verification_info["status"] = "completed"
            
        except Exception as e:
            verification_info["status"] = "failed"
            verification_info["error"] = str(e)
            logging.error(f"Verification failed: {e}")
            
        return verification_info
        
    def _verify_directories(self, verification_info: Dict[str, Any]):
        """Verify installation directories."""
        directories = [
            self.install_config["installation_path"],
            self.install_config["backup_path"],
            self.install_config["recovery_path"],
            self.install_config["log_path"],
            self.install_config["config_path"]
        ]
        
        for directory in directories:
            try:
                if not os.path.exists(directory):
                    raise Exception(f"Directory not found: {directory}")
                    
                # Check permissions
                if not os.access(directory, os.W_OK):
                    raise Exception(f"Directory not writable: {directory}")
                    
                verification_info["checks"].append({
                    "type": "directory",
                    "path": directory,
                    "status": "success"
                })
            except Exception as e:
                verification_info["checks"].append({
                    "type": "directory",
                    "path": directory,
                    "status": "failed",
                    "error": str(e)
                })
                raise
                
    def _verify_system_files(self, verification_info: Dict[str, Any]):
        """Verify system files."""
        # TODO: Implement system file verification
        pass
        
    def _verify_permissions(self, verification_info: Dict[str, Any]):
        """Verify system permissions."""
        # TODO: Implement permission verification
        pass
        
    def _verify_services(self, verification_info: Dict[str, Any]):
        """Verify system services."""
        # TODO: Implement service verification
        pass
        
    def _verify_network(self, verification_info: Dict[str, Any]):
        """Verify network connectivity."""
        try:
            # Check internet connectivity
            subprocess.run(["ping", "-c", "1", "8.8.8.8"], check=True)
            
            verification_info["checks"].append({
                "type": "network",
                "check": "internet_connectivity",
                "status": "success"
            })
        except Exception as e:
            verification_info["checks"].append({
                "type": "network",
                "check": "internet_connectivity",
                "status": "failed",
                "error": str(e)
            })
            raise
            
    def get_installation_status(self) -> Dict[str, Any]:
        """Get current installation status."""
        return {
            "config": self.install_config,
            "system_info": self._get_system_info(),
            "requirements": self.check_system_requirements(),
            "logs": self._get_recent_logs()
        }
        
    def _get_recent_logs(self) -> List[Dict[str, Any]]:
        """Get recent installation logs."""
        logs = []
        try:
            with open(self.install_config["log_path"], "r") as f:
                for line in f.readlines()[-100:]:  # Last 100 lines
                    logs.append({
                        "timestamp": line.split(" - ")[0],
                        "level": line.split(" - ")[1],
                        "message": line.split(" - ")[2].strip()
                    })
        except Exception as e:
            logging.error(f"Error reading logs: {e}")
        return logs 