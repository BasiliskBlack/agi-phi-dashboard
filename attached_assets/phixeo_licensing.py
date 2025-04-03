import hashlib
import json
import requests
from datetime import datetime, timedelta
from typing import Dict, Optional
import sqlite3
import uuid

class PhixeoLicense:
    """Licensing system for Phixeo enterprise features."""
    
    def __init__(self):
        self.db = sqlite3.connect('phixeo_licenses.db')
        self._setup_database()
        self.license_server = "https://api.phixeo.com/licenses"  # Replace with actual server
        
    def _setup_database(self):
        """Setup licensing database tables."""
        self.db.execute('''
            CREATE TABLE IF NOT EXISTS licenses (
                id INTEGER PRIMARY KEY,
                license_key TEXT UNIQUE,
                plan_type TEXT,
                features JSON,
                created_at TIMESTAMP,
                expires_at TIMESTAMP,
                max_users INTEGER,
                company_name TEXT,
                contact_email TEXT
            )
        ''')
        
        self.db.execute('''
            CREATE TABLE IF NOT EXISTS usage_logs (
                id INTEGER PRIMARY KEY,
                license_id INTEGER,
                feature_name TEXT,
                usage_count INTEGER,
                recorded_at TIMESTAMP,
                FOREIGN KEY (license_id) REFERENCES licenses (id)
            )
        ''')
        
        self.db.commit()
        
    def generate_license_key(self, plan_type: str, features: Dict, 
                           max_users: int, company_name: str, 
                           contact_email: str, duration_days: int = 365) -> str:
        """Generate a new license key."""
        license_key = str(uuid.uuid4())
        now = datetime.now()
        
        cursor = self.db.cursor()
        cursor.execute('''
            INSERT INTO licenses (
                license_key, plan_type, features, created_at,
                expires_at, max_users, company_name, contact_email
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            license_key,
            plan_type,
            json.dumps(features),
            now,
            now + timedelta(days=duration_days),
            max_users,
            company_name,
            contact_email
        ))
        
        self.db.commit()
        return license_key
        
    def validate_license(self, license_key: str) -> Dict:
        """Validate a license key and return its features."""
        cursor = self.db.cursor()
        cursor.execute('''
            SELECT * FROM licenses WHERE license_key = ?
        ''', (license_key,))
        
        license_data = cursor.fetchone()
        if not license_data:
            return {"valid": False, "error": "Invalid license key"}
            
        # Check expiration
        expires_at = datetime.fromisoformat(license_data[5])
        if expires_at < datetime.now():
            return {"valid": False, "error": "License expired"}
            
        # Get features
        features = json.loads(license_data[3])
        
        return {
            "valid": True,
            "features": features,
            "max_users": license_data[6],
            "company_name": license_data[7],
            "expires_at": expires_at
        }
        
    def log_feature_usage(self, license_key: str, feature_name: str):
        """Log usage of a licensed feature."""
        cursor = self.db.cursor()
        
        # Get license ID
        cursor.execute('SELECT id FROM licenses WHERE license_key = ?', (license_key,))
        license_id = cursor.fetchone()[0]
        
        # Log usage
        now = datetime.now()
        cursor.execute('''
            INSERT INTO usage_logs (license_id, feature_name, usage_count, recorded_at)
            VALUES (?, ?, 1, ?)
        ''', (license_id, feature_name, now))
        
        self.db.commit()
        
    def get_usage_statistics(self, license_key: str) -> Dict:
        """Get usage statistics for a license."""
        cursor = self.db.cursor()
        
        # Get license ID
        cursor.execute('SELECT id FROM licenses WHERE license_key = ?', (license_key,))
        license_id = cursor.fetchone()[0]
        
        # Get usage counts
        cursor.execute('''
            SELECT feature_name, SUM(usage_count) as total_usage
            FROM usage_logs
            WHERE license_id = ?
            GROUP BY feature_name
        ''', (license_id,))
        
        usage_stats = dict(cursor.fetchall())
        
        return {
            "total_features_used": len(usage_stats),
            "feature_usage": usage_stats
        }
        
    def upgrade_license(self, license_key: str, new_plan: str) -> bool:
        """Upgrade a license to a new plan."""
        cursor = self.db.cursor()
        
        # Get current license
        cursor.execute('SELECT * FROM licenses WHERE license_key = ?', (license_key,))
        current = cursor.fetchone()
        if not current:
            return False
            
        # Update plan
        cursor.execute('''
            UPDATE licenses
            SET plan_type = ?, features = ?
            WHERE license_key = ?
        ''', (
            new_plan,
            json.dumps(self._get_plan_features(new_plan)),
            license_key
        ))
        
        self.db.commit()
        return True
        
    def _get_plan_features(self, plan_type: str) -> Dict:
        """Get features included in each plan type."""
        plans = {
            "basic": {
                "max_nodes": 100,
                "max_connections": 500,
                "team_size": 5,
                "analytics": False,
                "version_control": False
            },
            "professional": {
                "max_nodes": 1000,
                "max_connections": 5000,
                "team_size": 20,
                "analytics": True,
                "version_control": True
            },
            "enterprise": {
                "max_nodes": float('inf'),
                "max_connections": float('inf'),
                "team_size": float('inf'),
                "analytics": True,
                "version_control": True,
                "custom_features": True
            }
        }
        return plans.get(plan_type, plans["basic"])
        
    def check_feature_access(self, license_key: str, feature_name: str) -> bool:
        """Check if a license has access to a specific feature."""
        cursor = self.db.cursor()
        cursor.execute('''
            SELECT features FROM licenses WHERE license_key = ?
        ''', (license_key,))
        
        features = json.loads(cursor.fetchone()[0])
        return features.get(feature_name, False)
        
    def get_license_info(self, license_key: str) -> Dict:
        """Get detailed information about a license."""
        cursor = self.db.cursor()
        cursor.execute('''
            SELECT * FROM licenses WHERE license_key = ?
        ''', (license_key,))
        
        license_data = cursor.fetchone()
        if not license_data:
            return {"error": "Invalid license key"}
            
        return {
            "plan_type": license_data[2],
            "features": json.loads(license_data[3]),
            "created_at": license_data[4],
            "expires_at": license_data[5],
            "max_users": license_data[6],
            "company_name": license_data[7],
            "contact_email": license_data[8]
        } 