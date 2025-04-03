import os
import sys
import json
import torch
import numpy as np
from typing import Dict, List, Any, Optional
from transformers import AutoTokenizer, AutoModelForCausalLM, AutoModelForSequenceClassification, AutoModelForVision2Seq
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest
import pandas as pd
import logging
from datetime import datetime
import speech_recognition as sr
import pyttsx3
import cv2
from PIL import Image
import threading
import queue
import time

class AdvancedAIAssistant:
    """Advanced AI assistant with multi-modal capabilities."""
    
    def __init__(self):
        # Initialize models
        self.tokenizer = AutoTokenizer.from_pretrained("gpt2-large")
        self.model = AutoModelForCausalLM.from_pretrained("gpt2-large")
        self.classifier = AutoModelForSequenceClassification.from_pretrained("microsoft/codebert-base")
        self.vision_model = AutoModelForVision2Seq.from_pretrained("microsoft/git-base-coco")
        
        # Initialize speech recognition
        self.recognizer = sr.Recognizer()
        self.engine = pyttsx3.init()
        
        # Initialize computer vision
        self.camera = None
        
        # Initialize analytics
        self.scaler = StandardScaler()
        self.anomaly_detector = IsolationForest(contamination=0.1)
        
        # Initialize state
        self.context_history = []
        self.user_preferences = {}
        self.system_state = {}
        self.command_queue = queue.Queue()
        self.is_listening = False
        
        # Setup logging
        self._setup_logging()
        
        # Start background tasks
        self._start_background_tasks()
        
    def _setup_logging(self):
        """Setup logging for AI operations."""
        logging.basicConfig(
            filename='ai_assistant.log',
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
        
    def _start_background_tasks(self):
        """Start background tasks for continuous operation."""
        # Start voice recognition thread
        self.voice_thread = threading.Thread(
            target=self._voice_recognition_loop,
            daemon=True
        )
        self.voice_thread.start()
        
        # Start command processing thread
        self.command_thread = threading.Thread(
            target=self._command_processing_loop,
            daemon=True
        )
        self.command_thread.start()
        
    def _voice_recognition_loop(self):
        """Continuous voice recognition loop."""
        self.is_listening = True
        while self.is_listening:
            try:
                with sr.Microphone() as source:
                    self.recognizer.adjust_for_ambient_noise(source)
                    audio = self.recognizer.listen(source)
                    
                try:
                    text = self.recognizer.recognize_google(audio)
                    self.command_queue.put({
                        "type": "voice",
                        "content": text,
                        "timestamp": datetime.now().isoformat()
                    })
                except sr.UnknownValueError:
                    pass
                except sr.RequestError as e:
                    logging.error(f"Could not request results: {e}")
                    
            except Exception as e:
                logging.error(f"Error in voice recognition: {e}")
                time.sleep(1)
                
    def _command_processing_loop(self):
        """Process commands from queue."""
        while True:
            try:
                command = self.command_queue.get()
                self.process_command(command)
            except Exception as e:
                logging.error(f"Error processing command: {e}")
            time.sleep(0.1)
            
    def process_command(self, command: Dict[str, Any]) -> Dict[str, Any]:
        """Process user command with advanced context awareness."""
        # Add command to context
        self.context_history.append({
            "type": "command",
            "content": command["content"],
            "timestamp": command["timestamp"]
        })
        
        # Analyze command intent
        intent = self._analyze_intent(command["content"])
        
        # Get relevant context
        context = self._get_relevant_context(command["content"])
        
        # Generate response
        response = self._generate_response(command["content"], intent, context)
        
        # Update system state
        self._update_system_state()
        
        # Log interaction
        logging.info(f"Processed command: {json.dumps(command)}")
        
        return {
            "response": response,
            "intent": intent,
            "context": context,
            "timestamp": datetime.now().isoformat()
        }
        
    def _analyze_intent(self, text: str) -> Dict[str, Any]:
        """Analyze text intent using advanced NLP."""
        # Prepare input
        inputs = self.tokenizer(text, return_tensors="pt")
        
        # Get intent classification
        outputs = self.classifier(**inputs)
        intent_scores = outputs.logits.softmax(dim=1)
        
        # Map scores to intents
        intents = {
            "command": float(intent_scores[0][0]),
            "question": float(intent_scores[0][1]),
            "request": float(intent_scores[0][2]),
            "statement": float(intent_scores[0][3]),
            "emergency": float(intent_scores[0][4])
        }
        
        # Get primary intent
        primary_intent = max(intents.items(), key=lambda x: x[1])
        
        return {
            "primary": primary_intent[0],
            "scores": intents,
            "confidence": primary_intent[1]
        }
        
    def _get_relevant_context(self, text: str) -> Dict[str, Any]:
        """Get relevant context for the command."""
        # Extract key terms
        key_terms = self._extract_key_terms(text)
        
        # Get recent context
        recent_context = self.context_history[-5:]
        
        # Get system state
        current_state = self.system_state
        
        # Get user preferences
        relevant_preferences = {
            k: v for k, v in self.user_preferences.items()
            if any(term in k.lower() for term in key_terms)
        }
        
        # Get visual context if available
        visual_context = self._get_visual_context()
        
        return {
            "key_terms": key_terms,
            "recent_context": recent_context,
            "system_state": current_state,
            "user_preferences": relevant_preferences,
            "visual_context": visual_context
        }
        
    def _get_visual_context(self) -> Optional[Dict[str, Any]]:
        """Get visual context from camera."""
        if self.camera is None:
            try:
                self.camera = cv2.VideoCapture(0)
            except:
                return None
                
        ret, frame = self.camera.read()
        if not ret:
            return None
            
        # Convert frame to PIL Image
        image = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        
        # Get image description
        inputs = self.vision_model.preprocess_image(image)
        outputs = self.vision_model.generate(**inputs)
        description = self.vision_model.decode(outputs[0])
        
        return {
            "description": description,
            "timestamp": datetime.now().isoformat()
        }
        
    def _generate_response(self, text: str, intent: Dict[str, Any],
                          context: Dict[str, Any]) -> str:
        """Generate context-aware response."""
        # Prepare input with context
        context_text = self._format_context(context)
        full_input = f"Context: {context_text}\nCommand: {text}"
        
        # Generate response
        inputs = self.tokenizer(full_input, return_tensors="pt")
        outputs = self.model.generate(
            inputs.input_ids,
            max_length=200,
            num_return_sequences=1,
            temperature=0.7,
            top_p=0.9
        )
        
        response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Add response to context
        self.context_history.append({
            "type": "response",
            "content": response,
            "timestamp": datetime.now().isoformat()
        })
        
        # Speak response if it's a voice command
        if intent["primary"] == "command":
            self.speak(response)
            
        return response
        
    def speak(self, text: str):
        """Convert text to speech."""
        try:
            self.engine.say(text)
            self.engine.runAndWait()
        except Exception as e:
            logging.error(f"Error in text-to-speech: {e}")
            
    def _extract_key_terms(self, text: str) -> List[str]:
        """Extract key terms from text."""
        # Tokenize text
        tokens = self.tokenizer.tokenize(text)
        
        # Filter for important terms
        key_terms = [
            token for token in tokens
            if not token.startswith("##") and len(token) > 2
        ]
        
        return key_terms
        
    def _format_context(self, context: Dict[str, Any]) -> str:
        """Format context for model input."""
        context_parts = []
        
        # Add recent context
        if context["recent_context"]:
            context_parts.append("Recent interactions:")
            for item in context["recent_context"]:
                context_parts.append(f"- {item['type']}: {item['content']}")
                
        # Add system state
        if context["system_state"]:
            context_parts.append("System state:")
            for key, value in context["system_state"].items():
                context_parts.append(f"- {key}: {value}")
                
        # Add user preferences
        if context["user_preferences"]:
            context_parts.append("User preferences:")
            for key, value in context["user_preferences"].items():
                context_parts.append(f"- {key}: {value}")
                
        # Add visual context
        if context["visual_context"]:
            context_parts.append("Visual context:")
            context_parts.append(f"- {context['visual_context']['description']}")
            
        return "\n".join(context_parts)
        
    def _update_system_state(self):
        """Update system state with current metrics."""
        # Get system metrics
        cpu_percent = psutil.cpu_percent()
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # Update state
        self.system_state = {
            "cpu_usage": cpu_percent,
            "memory_usage": memory.percent,
            "disk_usage": disk.percent,
            "timestamp": datetime.now().isoformat()
        }
        
    def predict_system_behavior(self, time_window: int = 3600) -> Dict[str, Any]:
        """Predict system behavior for the next time window."""
        # Get historical data
        historical_data = self._get_historical_data(time_window)
        
        # Prepare features
        features = self._prepare_prediction_features(historical_data)
        
        # Detect anomalies
        anomalies = self._detect_anomalies(features)
        
        # Generate predictions
        predictions = self._generate_predictions(features)
        
        return {
            "predictions": predictions,
            "anomalies": anomalies,
            "confidence": self._calculate_prediction_confidence(predictions)
        }
        
    def _get_historical_data(self, time_window: int) -> pd.DataFrame:
        """Get historical system data."""
        # Convert context history to DataFrame
        df = pd.DataFrame(self.context_history)
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        
        # Filter by time window
        cutoff = datetime.now() - pd.Timedelta(seconds=time_window)
        df = df[df['timestamp'] > cutoff]
        
        return df
        
    def _prepare_prediction_features(self, data: pd.DataFrame) -> np.ndarray:
        """Prepare features for prediction."""
        # Extract features from data
        features = []
        
        # Command frequency
        command_counts = data[data['type'] == 'command'].groupby(
            pd.Grouper(key='timestamp', freq='1H')
        ).size()
        
        # Response times
        response_times = []
        for i in range(len(data)-1):
            if data.iloc[i]['type'] == 'command' and data.iloc[i+1]['type'] == 'response':
                response_time = (data.iloc[i+1]['timestamp'] - data.iloc[i]['timestamp']).total_seconds()
                response_times.append(response_time)
                
        # System metrics
        system_metrics = pd.DataFrame([
            self.system_state for _ in range(len(data))
        ])
        
        # Combine features
        features = np.column_stack([
            command_counts.values,
            response_times,
            system_metrics.values
        ])
        
        return features
        
    def _detect_anomalies(self, features: np.ndarray) -> List[Dict[str, Any]]:
        """Detect anomalies in system behavior."""
        # Scale features
        scaled_features = self.scaler.fit_transform(features)
        
        # Detect anomalies
        predictions = self.anomaly_detector.fit_predict(scaled_features)
        
        # Format results
        anomalies = []
        for i, pred in enumerate(predictions):
            if pred == -1:  # Anomaly detected
                anomalies.append({
                    "index": i,
                    "features": features[i].tolist(),
                    "timestamp": datetime.now().isoformat()
                })
                
        return anomalies
        
    def _generate_predictions(self, features: np.ndarray) -> Dict[str, Any]:
        """Generate system behavior predictions."""
        # Use historical patterns to predict future behavior
        predictions = {
            "command_frequency": self._predict_command_frequency(features),
            "response_times": self._predict_response_times(features),
            "system_load": self._predict_system_load(features)
        }
        
        return predictions
        
    def _predict_command_frequency(self, features: np.ndarray) -> Dict[str, Any]:
        """Predict future command frequency."""
        # Simple moving average prediction
        command_counts = features[:, 0]
        window_size = min(24, len(command_counts))
        
        if window_size > 0:
            moving_avg = np.mean(command_counts[-window_size:])
            std_dev = np.std(command_counts[-window_size:])
            
            return {
                "expected": float(moving_avg),
                "confidence": float(1 / (1 + std_dev)),
                "time_window": "1 hour"
            }
        else:
            return {
                "expected": 0.0,
                "confidence": 0.0,
                "time_window": "1 hour"
            }
            
    def _predict_response_times(self, features: np.ndarray) -> Dict[str, Any]:
        """Predict future response times."""
        response_times = features[:, 1]
        
        if len(response_times) > 0:
            avg_time = np.mean(response_times)
            std_dev = np.std(response_times)
            
            return {
                "expected": float(avg_time),
                "confidence": float(1 / (1 + std_dev)),
                "time_window": "next command"
            }
        else:
            return {
                "expected": 0.0,
                "confidence": 0.0,
                "time_window": "next command"
            }
            
    def _predict_system_load(self, features: np.ndarray) -> Dict[str, Any]:
        """Predict future system load."""
        system_metrics = features[:, 2:]
        
        if len(system_metrics) > 0:
            avg_load = np.mean(system_metrics, axis=0)
            std_dev = np.std(system_metrics, axis=0)
            
            return {
                "cpu_usage": {
                    "expected": float(avg_load[0]),
                    "confidence": float(1 / (1 + std_dev[0]))
                },
                "memory_usage": {
                    "expected": float(avg_load[1]),
                    "confidence": float(1 / (1 + std_dev[1]))
                },
                "disk_usage": {
                    "expected": float(avg_load[2]),
                    "confidence": float(1 / (1 + std_dev[2]))
                },
                "time_window": "1 hour"
            }
        else:
            return {
                "cpu_usage": {"expected": 0.0, "confidence": 0.0},
                "memory_usage": {"expected": 0.0, "confidence": 0.0},
                "disk_usage": {"expected": 0.0, "confidence": 0.0},
                "time_window": "1 hour"
            }
            
    def _calculate_prediction_confidence(self, predictions: Dict[str, Any]) -> float:
        """Calculate overall confidence in predictions."""
        confidences = []
        
        # Command frequency confidence
        confidences.append(predictions["command_frequency"]["confidence"])
        
        # Response time confidence
        confidences.append(predictions["response_times"]["confidence"])
        
        # System load confidences
        for metric in ["cpu_usage", "memory_usage", "disk_usage"]:
            confidences.append(predictions["system_load"][metric]["confidence"])
            
        # Calculate weighted average
        weights = [0.2, 0.2, 0.2, 0.2, 0.2]
        return float(np.average(confidences, weights=weights))
        
    def optimize_system(self) -> Dict[str, Any]:
        """Optimize system using AI insights."""
        # Get current state
        current_state = self.system_state
        
        # Get predictions
        predictions = self.predict_system_behavior()
        
        # Generate optimization suggestions
        suggestions = self._generate_optimization_suggestions(current_state, predictions)
        
        # Calculate potential improvements
        improvements = self._calculate_potential_improvements(suggestions)
        
        return {
            "suggestions": suggestions,
            "improvements": improvements,
            "confidence": self._calculate_optimization_confidence(suggestions)
        }
        
    def _generate_optimization_suggestions(self, current_state: Dict[str, Any],
                                         predictions: Dict[str, Any]) -> List[str]:
        """Generate system optimization suggestions."""
        suggestions = []
        
        # CPU optimization
        if current_state["cpu_usage"] > 80:
            suggestions.append("Consider closing resource-intensive applications")
            
        # Memory optimization
        if current_state["memory_usage"] > 80:
            suggestions.append("Clear unused memory and cache")
            
        # Disk optimization
        if current_state["disk_usage"] > 80:
            suggestions.append("Free up disk space by removing unnecessary files")
            
        # Predictive optimizations
        if predictions["system_load"]["cpu_usage"]["expected"] > 90:
            suggestions.append("Prepare for high CPU load in the next hour")
            
        if predictions["system_load"]["memory_usage"]["expected"] > 90:
            suggestions.append("Prepare for high memory usage in the next hour")
            
        return suggestions
        
    def _calculate_potential_improvements(self, suggestions: List[str]) -> Dict[str, float]:
        """Calculate potential improvements from suggestions."""
        improvements = {}
        
        for suggestion in suggestions:
            if "CPU" in suggestion:
                improvements["cpu_usage"] = 0.15  # 15% potential improvement
            elif "memory" in suggestion.lower():
                improvements["memory_usage"] = 0.20  # 20% potential improvement
            elif "disk" in suggestion.lower():
                improvements["disk_usage"] = 0.10  # 10% potential improvement
                
        return improvements
        
    def _calculate_optimization_confidence(self, suggestions: List[str]) -> float:
        """Calculate confidence in optimization suggestions."""
        # Base confidence on number and type of suggestions
        base_confidence = 0.5
        
        # Adjust based on suggestion specificity
        specific_suggestions = sum(1 for s in suggestions if len(s.split()) > 3)
        confidence_adjustment = specific_suggestions * 0.1
        
        return min(0.95, base_confidence + confidence_adjustment) 