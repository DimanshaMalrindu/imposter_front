import React from "react";
import { motion } from "framer-motion";

const UnoLobby = ({ team, onStartGame }) => {
  if (!team) return null;

  return (
    <div className="container">
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
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Team: {team.name}
        </h2>

        <div
          style={{
            background: "rgba(245, 158, 11, 0.1)",
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
              color: "#f59e0b",
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
          Players ({team.players.length})
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
              <span style={{ fontSize: "1.5rem" }}>🃏</span>
              <span style={{ fontSize: "1.1rem" }}>{player.name}</span>
              <span
                style={{
                  marginLeft: "auto",
                  padding: "0.25rem 0.75rem",
                  background: "rgba(245, 158, 11, 0.2)",
                  borderRadius: "12px",
                  fontSize: "0.9rem",
                  color: "#f59e0b",
                }}
              >
                Player {index + 1}
              </span>
            </motion.div>
          ))}
        </div>

        <div
          style={{
            background: "rgba(245, 158, 11, 0.05)",
            padding: "1.5rem",
            borderRadius: "12px",
            marginBottom: "2rem",
            border: "1px solid rgba(245, 158, 11, 0.2)",
          }}
        >
          <h4
            style={{
              fontSize: "1.1rem",
              marginBottom: "0.75rem",
              color: "var(--text-primary)",
            }}
          >
            Game Rules:
          </h4>
          <ul
            style={{
              fontSize: "0.95rem",
              color: "var(--text-secondary)",
              lineHeight: "1.8",
              paddingLeft: "1.5rem",
            }}
          >
            <li>Match the card color or number</li>
            <li>Use special cards to skip, reverse, or make others draw</li>
            <li>Wild cards can be any color</li>
            <li>Call "UNO" when you have one card left!</li>
            <li>First player to play all cards wins</li>
          </ul>
        </div>

        {team.players.length >= 2 ? (
          <motion.button
            className="btn btn-primary"
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              fontSize: "1.2rem",
              padding: "1rem",
            }}
            onClick={onStartGame}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Start Game 🃏
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

export default UnoLobby;
