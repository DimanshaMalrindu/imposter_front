import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const RejoinModal = ({ gameName, onRejoin, onNewTeam }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10000,
          backdropFilter: "blur(8px)",
        }}
      >
        <motion.div
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          className="card"
          style={{
            maxWidth: "500px",
            margin: "2rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "3rem",
              marginBottom: "1rem",
            }}
          >
            🎮
          </div>

          <h2
            style={{
              fontSize: "2rem",
              marginBottom: "1rem",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Continue Playing?
          </h2>

          <p
            style={{
              fontSize: "1.1rem",
              color: "var(--text-secondary)",
              marginBottom: "2rem",
              lineHeight: "1.6",
            }}
          >
            You have an active <strong>{gameName}</strong> game in progress.
            <br />
            Would you like to rejoin your team or start fresh?
          </p>

          <div
            style={{
              display: "flex",
              gap: "1rem",
              flexDirection: "column",
            }}
          >
            <motion.button
              className="btn btn-primary"
              onClick={onRejoin}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: "1rem 2rem",
                fontSize: "1.1rem",
                background: "linear-gradient(135deg, #10b981, #059669)",
                border: "none",
              }}
            >
              🔄 Rejoin Previous Team
            </motion.button>

            <motion.button
              className="btn"
              onClick={onNewTeam}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: "1rem 2rem",
                fontSize: "1.1rem",
                background: "rgba(99, 102, 241, 0.2)",
                border: "2px solid var(--primary-color)",
                color: "var(--primary-color)",
              }}
            >
              ➕ Join New Team
            </motion.button>
          </div>

          <p
            style={{
              marginTop: "1.5rem",
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
              fontStyle: "italic",
            }}
          >
            Note: Creating a new team will disconnect you from your current game
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RejoinModal;
