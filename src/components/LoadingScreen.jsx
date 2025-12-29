import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LoadingScreen = ({ onComplete }) => {
  const [showBranding, setShowBranding] = useState(true);
  const [showCredits, setShowCredits] = useState(false);

  useEffect(() => {
    // Show branding for 1.5 seconds
    const brandingTimer = setTimeout(() => {
      setShowBranding(false);
      setShowCredits(true);
    }, 1500);

    // Show credits for 1.5 seconds, then complete
    const creditsTimer = setTimeout(() => {
      setShowCredits(false);
    }, 4000);

    // Complete animation after fade out
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 5500);

    return () => {
      clearTimeout(brandingTimer);
      clearTimeout(creditsTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100000,
        overflow: "hidden",
      }}
    >
      {/* Animated background particles */}
      <div className="particles">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="particle"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.6, scale: 1 }}
            transition={{
              duration: 2,
              delay: i * 0.2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            style={{
              width: `${Math.random() * 150 + 100}px`,
              height: `${Math.random() * 150 + 100}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`,
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {showBranding && (
          <motion.div
            key="branding"
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.2, y: -50 }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
            }}
            style={{
              textAlign: "center",
              position: "relative",
              zIndex: 10,
            }}
          >
            <motion.div
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{
                duration: 1,
                ease: "easeOut",
              }}
              style={{
                fontSize: "6rem",
                marginBottom: "1rem",
              }}
            >
              🎲
            </motion.div>

            <motion.h1
              initial={{ letterSpacing: "0.5em", opacity: 0 }}
              animate={{ letterSpacing: "0.1em", opacity: 1 }}
              transition={{
                duration: 1,
                delay: 0.3,
              }}
              style={{
                fontSize: "4rem",
                fontWeight: "bold",
                background:
                  "linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: "0.5rem",
                textShadow: "0 0 40px rgba(99, 102, 241, 0.5)",
              }}
            >
              Board Games
            </motion.h1>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "200px" }}
              transition={{
                duration: 0.8,
                delay: 0.6,
              }}
              style={{
                height: "3px",
                background:
                  "linear-gradient(90deg, transparent, #6366f1, transparent)",
                margin: "1rem auto",
              }}
            />
          </motion.div>
        )}

        {showCredits && (
          <motion.div
            key="credits"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
            }}
            style={{
              textAlign: "center",
              position: "relative",
              zIndex: 10,
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                duration: 0.5,
                type: "spring",
                stiffness: 200,
              }}
              style={{
                fontSize: "3rem",
                marginBottom: "1rem",
              }}
            >
              👨‍💻
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{
                fontSize: "1.2rem",
                color: "var(--text-secondary)",
                marginBottom: "0.5rem",
              }}
            >
              Developed by
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{
                fontSize: "2.5rem",
                fontWeight: "bold",
                background: "linear-gradient(135deg, #10b981, #3b82f6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Dima
            </motion.h2>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                duration: 0.8,
                delay: 0.7,
              }}
              style={{
                height: "2px",
                background:
                  "linear-gradient(90deg, transparent, #10b981, transparent)",
                margin: "1rem auto",
                width: "150px",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pulse effect */}
      <motion.div
        initial={{ opacity: 0.3, scale: 1 }}
        animate={{ opacity: 0, scale: 2.5 }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeOut",
        }}
        style={{
          position: "absolute",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          border: "2px solid rgba(99, 102, 241, 0.5)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

export default LoadingScreen;
