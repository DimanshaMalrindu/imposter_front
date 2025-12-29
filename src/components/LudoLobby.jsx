import React from "react";
import { motion } from "framer-motion";
import LudoBoard from "./LudoBoard";

const LudoLobby = ({ team, onStartGame, onBackToSelection }) => {
  if (!team) return null;

  const colorEmojis = {
    red: "🔴",
    blue: "🔵",
    green: "🟢",
    yellow: "🟡",
  };

  return (
    <div className="container">
      {/* Branding Header */}
      <div
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
        className="card"
        style={{ marginTop: "2rem", maxWidth: "900px", margin: "2rem auto" }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <h2
          style={{
            textAlign: "center",
            fontSize: "2rem",
            marginBottom: "1rem",
            background: "linear-gradient(135deg, #10b981, #059669)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Team: {team.name}
        </h2>

        <div
          style={{
            background: "rgba(16, 185, 129, 0.1)",
            padding: "1rem",
            borderRadius: "12px",
            marginBottom: "2rem",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
            Team ID
          </p>
          <p
            style={{
              fontSize: "1.2rem",
              fontWeight: "bold",
              color: "var(--success-color)",
              letterSpacing: "2px",
            }}
          >
            {team.id}
          </p>
        </div>

        <h3
          style={{
            fontSize: "1.3rem",
            marginBottom: "1rem",
            color: "var(--text-primary)",
          }}
        >
          Players ({team.players.length}/4)
        </h3>

        <div style={{ marginBottom: "2rem" }}>
          {team.players.map((player, index) => (
            <motion.div
              key={player.id}
              className="player-item"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <span style={{ fontSize: "1.5rem" }}>
                {colorEmojis[player.color]}
              </span>
              <span style={{ fontSize: "1.1rem" }}>{player.name}</span>
              <span
                style={{
                  marginLeft: "auto",
                  padding: "0.25rem 0.75rem",
                  background: "rgba(16, 185, 129, 0.2)",
                  borderRadius: "12px",
                  fontSize: "0.9rem",
                  color: "var(--success-color)",
                }}
              >
                {player.color.toUpperCase()}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Ludo Board */}
        <div style={{ marginBottom: "2rem" }}>
          <h3
            style={{
              fontSize: "1.3rem",
              marginBottom: "1rem",
              color: "var(--text-primary)",
              textAlign: "center",
            }}
          >
            Game Board
          </h3>
          <LudoBoard team={team} playerId={null} isGameStarted={false} />
        </div>

        {team.players.length >= 2 ? (
          <motion.button
            className="btn btn-primary"
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #10b981, #059669)",
              fontSize: "1.2rem",
              padding: "1rem",
            }}
            onClick={onStartGame}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Start Game 🎲
          </motion.button>
        ) : (
          <div
            style={{
              padding: "1rem",
              background: "rgba(251, 191, 36, 0.1)",
              borderRadius: "12px",
              textAlign: "center",
              border: "1px solid rgba(251, 191, 36, 0.3)",
            }}
          >
            <p style={{ color: "var(--warning-color)" }}>
              Waiting for at least 2 players to start...
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default LudoLobby;
