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
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎭</div>
            <div>Your Word</div>
          </div>
        </div>
        <div className={`flip-card-back ${isImposter ? "imposter" : ""}`}>
          <div style={{ textAlign: "center", padding: "2rem" }}>
            {isImposter && (
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🕵️</div>
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
}) => {
  const totalPlayers = team?.players.length || 0;
  const revealedCount = revealProgress?.revealedCount || 0;
  const allRevealed =
    revealProgress?.totalPlayers === revealedCount && revealedCount > 0;

  const socket = socketService.getSocket();
  const teamId = team?.id;

  return (
    <div className="container">
      <motion.div
        className="card"
        style={{ marginTop: "2rem", maxWidth: "700px", margin: "2rem auto" }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "2rem",
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
            marginTop: "2rem",
            padding: "1.5rem",
            background: isImposter
              ? "rgba(239, 68, 68, 0.1)"
              : "rgba(16, 185, 129, 0.1)",
            borderRadius: "12px",
            border: `1px solid ${
              isImposter ? "rgba(239, 68, 68, 0.3)" : "rgba(16, 185, 129, 0.3)"
            }`,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <p
            style={{
              fontSize: "1.2rem",
              fontWeight: "bold",
              color: isImposter
                ? "var(--danger-color)"
                : "var(--success-color)",
            }}
          >
            {isImposter
              ? "🕵️ You are the IMPOSTER!"
              : "✨ You are a normal player!"}
          </p>
          <p
            style={{
              marginTop: "0.5rem",
              color: "var(--text-secondary)",
              fontSize: "0.95rem",
            }}
          >
            {isImposter
              ? "Try to blend in without knowing the secret word!"
              : "Try to identify who doesn't know the word!"}
          </p>
        </motion.div>

        <VoiceChat
          socket={socket}
          teamId={teamId}
          playerId={playerId}
          team={team}
          activeSpeakers={activeSpeakers}
        />

        <motion.div
          style={{ marginTop: "2rem" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
              padding: "1rem",
              background: "rgba(99, 102, 241, 0.1)",
              borderRadius: "12px",
            }}
          >
            <span style={{ color: "var(--text-secondary)" }}>
              Players ready to reveal:
            </span>
            <span
              style={{
                fontWeight: "bold",
                fontSize: "1.3rem",
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
          style={{ marginTop: "2rem" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <h3
            style={{
              marginBottom: "1rem",
              color: "var(--text-secondary)",
              fontSize: "1rem",
            }}
          >
            👥 Players in this game:
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
              gap: "0.5rem",
            }}
          >
            {team?.players.map((player) => (
              <motion.div
                key={player.id}
                style={{
                  padding: "0.75rem",
                  background: "rgba(99, 102, 241, 0.1)",
                  borderRadius: "8px",
                  textAlign: "center",
                  fontSize: "0.9rem",
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
  );
};

export default Game;
