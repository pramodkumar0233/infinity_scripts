import React, { useState, useEffect } from "react";

function TTSPage() {
  const [inputText, setInputText] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioInstance, setAudioInstance] = useState(null);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioInstance) {
        audioInstance.pause();
        URL.revokeObjectURL(audioInstance.src);
      }
    };
  }, [audioInstance]);

  const handleSpeak = async () => {
    if (!inputText.trim()) {
      alert("Please enter some text");
      return;
    }

    if (isPlaying && audioInstance) {
      audioInstance.pause(); // Stop current playback if speaking
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);

    try {
      console.log("[📤] Sending text to TTS API...");

      const response = await fetch("http://localhost:6000/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `TTS Error: ${response.status}`
        );
      }

      const blob = await response.blob();
      if (blob.size === 0) throw new Error("Empty audio blob received");

      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      setAudioInstance(audio);

      audio.onended = () => {
        setIsPlaying(false);
        setIsLoading(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        throw new Error("Audio playback failed");
      };

      await audio.play();
      setIsPlaying(true);
      setIsLoading(false);

    } catch (err) {
      console.error("[❌] TTS Error:", err);
      alert(err.message);
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h2>🗣️ Text-to-Speech</h2>
      <textarea
        rows={6}
        style={{ 
          width: "100%",
          padding: "1rem",
          fontSize: "1rem",
          marginBottom: "1rem",
          border: "1px solid #ccc",
          borderRadius: "4px"
        }}
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Enter text to convert to speech"
      />
      
      <button
        onClick={handleSpeak}
        disabled={isLoading}
        style={{
          padding: "0.5rem 1.5rem",
          fontSize: "1rem",
          backgroundColor: isLoading ? "#ccc" : isPlaying ? "#ff6b6b" : "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer"
        }}
      >
        {isLoading ? "⏳ Processing..." : isPlaying ? "⏹ Stop" : "🔊 Play Audio"}
      </button>

      {isLoading && <p style={{ marginTop: "1rem" }}>Generating audio...</p>}
    </div>
  );
}

export default TTSPage;