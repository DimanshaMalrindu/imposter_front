import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ImposterReveal = ({ isImposter, imposterName }) => {
  const [show, setShow] = useState(true);
  const alarmAudioRef = useRef(null);
  const playCountRef = useRef(0);

  useEffect(() => {
    // Play sound three times for the imposter
    if (isImposter && alarmAudioRef.current) {
      alarmAudioRef.current.volume = 0.6;

      const playSound = () => {
        if (playCountRef.current < 3 && alarmAudioRef.current) {
          alarmAudioRef.current.currentTime = 0;
          alarmAudioRef.current
            .play()
            .catch((e) => console.error("Sound play error:", e));
          playCountRef.current += 1;
        }
      };

      // Handle when sound ends to play again
      const handleEnded = () => {
        if (playCountRef.current < 3) {
          playSound();
        }
      };

      alarmAudioRef.current.addEventListener("ended", handleEnded);

      // Play the first time
      playSound();

      return () => {
        if (alarmAudioRef.current) {
          alarmAudioRef.current.removeEventListener("ended", handleEnded);
        }
      };
    }
  }, [isImposter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 5000);

    return () => {
      clearTimeout(timer);
      if (alarmAudioRef.current) {
        alarmAudioRef.current.pause();
        alarmAudioRef.current.currentTime = 0;
      }
    };
  }, []);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="full-screen-overlay red-flash"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          background: isImposter
            ? "linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95))"
            : "rgba(30, 27, 75, 0.95)",
        }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            duration: 0.8,
          }}
          style={{ textAlign: "center" }}
        >
          <motion.div
            style={{ fontSize: "8rem", marginBottom: "1rem" }}
            animate={{
              rotate: [0, -10, 10, -10, 0],
              scale: [1, 1.1, 1, 1.1, 1],
            }}
            transition={{ duration: 0.5, repeat: 9 }}
          >
            {isImposter ? "🕵️" : "👀"}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              fontSize: isImposter ? "inherit" : "2rem",
              fontWeight: "bold",
            }}
          >
            {isImposter ? (
              "YOU ARE THE IMPOSTER!"
            ) : (
              <>
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
                  THE IMPOSTER IS
                </div>
                <div
                  style={{
                    fontSize: "3.5rem",
                    color: "#ef4444",
                    textShadow: "0 0 20px rgba(239, 68, 68, 0.8)",
                  }}
                >
                  {imposterName || "Unknown"}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>

        {/* Alarm sound for imposter reveal */}
        <audio ref={alarmAudioRef} preload="auto" style={{ display: "none" }}>
          <source
            src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
            type="audio/mpeg"
          />
        </audio>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImposterReveal;
