"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";

interface LanguageDetectorProps {
  onLanguageDetected: (language: string, countryCode: string) => void;
}

export function LanguageDetector({ onLanguageDetected }: LanguageDetectorProps) {
  useEffect(() => {
    console.log("🔍 LanguageDetector mounted - starting detection");
    
    const detectLanguage = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        console.log(`📍 Calling geolocation API: ${apiUrl}/get-user-location`);
        
        const response = await fetch(`${apiUrl}/get-user-location`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          console.warn("❌ Geolocation API error:", response.status);
          localStorage.setItem("language_detection_complete", "true");
          return;
        }

        const data = await response.json();
        console.log("📡 Backend response:", data);
        
        const { language, country_code, is_development } = data;

        if (language && country_code) {
          console.log(`✅ Detection success: ${country_code} → ${language}`);
          
          // Save to localStorage
          localStorage.setItem("detected_language", language);
          localStorage.setItem("country_code", country_code);
          localStorage.setItem("language_detected", "true");
          localStorage.setItem("language_detection_complete", "true");

          // Callback to parent component
          onLanguageDetected(language, country_code);

          // Show magic toast only if not in development
          if (!is_development) {
            toast.success(`🌍 Detected: ${country_code}`, {
              duration: 3,
              position: "top-right",
            });
          }
        }
      } catch (error) {
        console.error("❌ Language detection error:", error);
        localStorage.setItem("language_detection_complete", "true");
      }
    };

    // Always run detection on mount
    detectLanguage();
  }, [onLanguageDetected]);

  return null; // Invisible component
}
