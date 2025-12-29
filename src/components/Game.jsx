import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import VoiceChat from "./VoiceChat";
import socketService from "../services/socketService";

const FlipCard = ({ word, isImposter }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFlipped(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`flip-card ${isFlipped ? "flipped" : ""}`}>
      <div className="flip-card-inner">
        <div className="flip-card-front">
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🎭</div>
            <div>Your Word</div>
          </div>
        </div>
        <div className={`flip-card-back ${isImposter ? "imposter" : ""}`}>
          <div style={{ textAlign: "center", padding: "1.5rem" }}>
            {isImposter && (
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🕵️</div>
            )}
            <div style={{ wordBreak: "break-word" }}>{word}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Game = ({
  word,
  isImposter,
  team,
  playerId,
  activeSpeakers,
  onRevealVote,
  revealProgress,
  onNewRound,
  onBackToSelection,
}) => {
  const totalPlayers = team?.players.length || 0;
  const revealedCount = revealProgress?.revealedCount || 0;
  const allRevealed =
    revealProgress?.totalPlayers === revealedCount && revealedCount > 0;

  const socket = socketService.getSocket();
  const teamId = team?.id;

  return (
    <>
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
      <div
        className="container"
        style={{ padding: "1rem", maxHeight: "100vh", overflow: "hidden" }}
      >
        <motion.div
          className="card"
          style={{
            maxWidth: "700px",
            margin: "0 auto",
            padding: "1.5rem",
            maxHeight: "calc(100vh - 2rem)",
            overflowY: "auto",
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div style={{ textAlign: "center", marginBottom: "1rem" }}>
            <h2
              style={{
                fontSize: "1.5rem",
                background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              🎮 Game in Progress
            </h2>
          </div>

          <FlipCard word={word} isImposter={isImposter} />

          <motion.div
            style={{
              textAlign: "center",
              marginTop: "1rem",
              padding: "1rem",
              background: isImposter
                ? "rgba(239, 68, 68, 0.1)"
                : "rgba(16, 185, 129, 0.1)",
              borderRadius: "12px",
              border: `1px solid ${
                isImposter
                  ? "rgba(239, 68, 68, 0.3)"
                  : "rgba(16, 185, 129, 0.3)"
              }`,
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <p
              style={{
                fontSize: "1rem",
                fontWeight: "bold",
                color: isImposter
                  ? "var(--danger-color)"
                  : "var(--success-color)",
                marginBottom: "0.25rem",
              }}
            >
              {isImposter
                ? "🕵️ You are the IMPOSTER!"
                : "✨ You are a normal player!"}
            </p>
            <p
              style={{
                marginTop: "0.25rem",
                color: "var(--text-secondary)",
                fontSize: "0.85rem",
              }}
            >
              {isImposter
                ? "Try to blend in without knowing the secret word!"
                : "Try to identify who doesn't know the word!"}
            </p>
          </motion.div>

          <motion.div
            style={{ marginTop: "1rem" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.75rem",
                padding: "0.75rem",
                background: "rgba(99, 102, 241, 0.1)",
                borderRadius: "12px",
              }}
            >
              <span
                style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}
              >
                Players ready to reveal:
              </span>
              <span
                style={{
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  color: "var(--primary-color)",
                }}
              >
                {revealedCount} / {totalPlayers}
              </span>
            </div>

            {!allRevealed ? (
              <motion.button
                className="btn btn-danger"
                style={{ width: "100%" }}
                onClick={onRevealVote}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  boxShadow: [
                    "0 10px 30px rgba(239, 68, 68, 0.3)",
                    "0 15px 40px rgba(239, 68, 68, 0.5)",
                    "0 10px 30px rgba(239, 68, 68, 0.3)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🔍 Ready to Reveal Imposter
              </motion.button>
            ) : (
              <motion.button
                className="btn btn-success"
                style={{ width: "100%" }}
                onClick={onNewRound}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 5.5 }}
              >
                🔄 Start New Round
              </motion.button>
            )}
          </motion.div>

          <motion.div
            style={{ marginTop: "1rem" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            <h3
              style={{
                marginBottom: "0.75rem",
                color: "var(--text-secondary)",
                fontSize: "0.9rem",
              }}
            >
              👥 Players in this game:
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                gap: "0.5rem",
              }}
            >
              {team?.players.map((player) => (
                <motion.div
                  key={player.id}
                  style={{
                    padding: "0.5rem",
                    background: "rgba(99, 102, 241, 0.1)",
                    borderRadius: "8px",
                    textAlign: "center",
                    fontSize: "0.85rem",
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  {player.name}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating voice chat component */}
      <VoiceChat
        socket={socket}
        teamId={teamId}
        playerId={playerId}
        team={team}
        activeSpeakers={activeSpeakers}
      />
    </>
  );
};

export default Game;
