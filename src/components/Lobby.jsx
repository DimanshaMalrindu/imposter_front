import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const Lobby = ({ team, onStartGame, onBackToSelection }) => {
  const canStart = team && team.players.length >= 2;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <div className="container">
      {/* Branding Header */}
      <div
        className="branding-header"
        onClick={onBackToSelection}
        style={{
          position: "fixed",
          top: "1rem",
          left: "1rem",
          fontSize: "1.5rem",
          fontWeight: "bold",
          color: "var(--primary-color)",
          cursor: "pointer",
          zIndex: 1000,
          padding: "0.5rem 1rem",
          borderRadius: "8px",
          background: "rgba(17, 24, 39, 0.8)",
          backdropFilter: "blur(10px)",
          border: "2px solid var(--primary-color)",
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.background = "rgba(99, 102, 241, 0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.background = "rgba(17, 24, 39, 0.8)";
        }}
      >
        🎲 Board Games
      </div>
      <motion.div
        className="card fade-in"
        style={{ marginTop: "2rem", maxWidth: "600px", margin: "2rem auto" }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "2rem",
              marginBottom: "0.5rem",
              background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Team Lobby
          </h2>
          <div
            style={{
              display: "inline-block",
              background: "rgba(99, 102, 241, 0.2)",
              padding: "0.5rem 1.5rem",
              borderRadius: "20px",
              marginTop: "1rem",
            }}
          >
            <span style={{ color: "var(--text-secondary)" }}>Team ID: </span>
            <span
              style={{
                fontWeight: "bold",
                color: "var(--primary-color)",
                fontSize: "1.2rem",
              }}
            >
              {team?.name}
            </span>
          </div>
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <h3
            style={{
              marginBottom: "1rem",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span>👥 Players</span>
            <span className="badge badge-success">{team?.players.length}</span>
          </h3>

          <motion.ul
            className="player-list"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {team?.players.map((player, index) => (
                <motion.li
                  key={player.id}
                  className="player-item"
                  variants={itemVariants}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="player-avatar">
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <span
                    style={{ flex: 1, fontSize: "1.1rem", fontWeight: "500" }}
                  >
                    {player.name}
                  </span>
                  <motion.div
                    className="badge badge-success"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                  >
                    Ready
                  </motion.div>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        </div>

        {!canStart && (
          <motion.div
            style={{
              textAlign: "center",
              padding: "1rem",
              background: "rgba(245, 158, 11, 0.1)",
              borderRadius: "12px",
              marginBottom: "1rem",
              border: "1px solid rgba(245, 158, 11, 0.3)",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p style={{ color: "var(--warning-color)" }}>
              ⚠️ Waiting for at least 2 players to start...
            </p>
          </motion.div>
        )}

        <motion.button
          className={`btn ${canStart ? "btn-success" : ""}`}
          style={{ width: "100%" }}
          onClick={onStartGame}
          disabled={!canStart}
          whileHover={canStart ? { scale: 1.05 } : {}}
          whileTap={canStart ? { scale: 0.95 } : {}}
          animate={
            canStart
              ? {
                  boxShadow: [
                    "0 10px 30px rgba(16, 185, 129, 0.3)",
                    "0 15px 40px rgba(16, 185, 129, 0.5)",
                    "0 10px 30px rgba(16, 185, 129, 0.3)",
                  ],
                }
              : {}
          }
          transition={{ duration: 2, repeat: Infinity }}
        >
          {canStart ? "🎮 Start Game" : "⏳ Waiting for Players"}
        </motion.button>

        <motion.p
          style={{
            textAlign: "center",
            marginTop: "1.5rem",
            color: "var(--text-secondary)",
            fontSize: "0.9rem",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Share the Team ID with your friends to join!
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Lobby;
