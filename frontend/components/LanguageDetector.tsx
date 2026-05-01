"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";

interface LanguageDetectorProps {
  onLanguageDetected: (language: string, countryCode: string) => void;
}

export function LanguageDetector({ onLanguageDetected }: LanguageDetectorProps) {
  useEffect(() => {
    const detectLanguage = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        
        const response = await fetch(`${apiUrl}/get-user-location`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          localStorage.setItem("language_detection_complete", "true");
          return;
        }

        const data = await response.json();
        const { language, country_code, is_development } = data;

        if (language && country_code) {
          localStorage.setItem("detected_language", language);
          localStorage.setItem("country_code", country_code);
          localStorage.setItem("language_detected", "true");
          localStorage.setItem("language_detection_complete", "true");

          onLanguageDetected(language, country_code);

          if (!is_development) {
            toast.success(`🌍 Detected: ${country_code}`, {
              duration: 3,
              position: "top-right",
            });
          }
        }
      } catch (error) {
        localStorage.setItem("language_detection_complete", "true");
      }
    };

    detectLanguage();
  }, []);

  return null; // Invisible component
}
