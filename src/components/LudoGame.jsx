import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LudoBoard from "./LudoBoard";

const LudoGame = ({ team, playerId, onRollDice, onMovePawn, onNewRound }) => {
  const [selectedPawn, setSelectedPawn] = useState(null);

  if (!team) return null;

  const currentPlayer = team.players.find((p) => p.id === team.currentTurn);
  const myPlayer = team.players.find((p) => p.id === playerId);
  const isMyTurn = team.currentTurn === playerId;

  const colorStyles = {
    red: { bg: "rgba(239, 68, 68, 0.2)", border: "#ef4444", text: "#ef4444" },
    blue: { bg: "rgba(59, 130, 246, 0.2)", border: "#3b82f6", text: "#3b82f6" },
    green: {
      bg: "rgba(16, 185, 129, 0.2)",
      border: "#10b981",
      text: "#10b981",
    },
    yellow: {
      bg: "rgba(251, 191, 36, 0.2)",
      border: "#fbbf24",
      text: "#fbbf24",
    },
  };

  const handleRollDice = () => {
    if (isMyTurn && !team.diceValue) {
      onRollDice();
    }
  };

  const handlePawnClick = (pawnIndex) => {
    if (isMyTurn && team.diceValue) {
      onMovePawn(pawnIndex);
    }
  };

  return (
    <div className="container">
      <motion.div
        className="card"
        style={{ marginTop: "2rem", maxWidth: "800px", margin: "2rem auto" }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "2rem",
              background: "linear-gradient(135deg, #10b981, #059669)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            🎲 Ludo Game in Progress
          </h2>
        </div>

        {/* Current Turn */}
        <div
          style={{
            padding: "1.5rem",
            background: currentPlayer
              ? colorStyles[currentPlayer.color].bg
              : "rgba(255, 255, 255, 0.1)",
            borderRadius: "12px",
            marginBottom: "2rem",
            textAlign: "center",
            border: `2px solid ${
              currentPlayer
                ? colorStyles[currentPlayer.color].border
                : "rgba(255, 255, 255, 0.3)"
            }`,
          }}
        >
          <p style={{ fontSize: "1rem", color: "var(--text-secondary)" }}>
            Current Turn
          </p>
          <p
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              color: currentPlayer
                ? colorStyles[currentPlayer.color].text
                : "white",
            }}
          >
            {currentPlayer?.name} ({currentPlayer?.color.toUpperCase()})
          </p>
          {isMyTurn && (
            <p
              style={{
                fontSize: "1rem",
                color: "var(--success-color)",
                marginTop: "0.5rem",
              }}
            >
              🎯 It's your turn!
            </p>
          )}
        </div>

        {/* Dice Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {!team.diceValue ? (
            <motion.button
              className="btn btn-primary"
              style={{
                background: isMyTurn
                  ? "linear-gradient(135deg, #10b981, #059669)"
                  : "rgba(100, 100, 100, 0.5)",
                fontSize: "1.5rem",
                padding: "1.5rem 3rem",
                cursor: isMyTurn ? "pointer" : "not-allowed",
              }}
              onClick={handleRollDice}
              disabled={!isMyTurn}
              whileHover={isMyTurn ? { scale: 1.05 } : {}}
              whileTap={isMyTurn ? { scale: 0.95 } : {}}
            >
              🎲 Roll Dice
            </motion.button>
          ) : (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              style={{
                fontSize: "5rem",
                background: "linear-gradient(135deg, #10b981, #059669)",
                borderRadius: "20px",
                padding: "2rem",
                boxShadow: "0 10px 30px rgba(16, 185, 129, 0.3)",
              }}
            >
              {team.diceValue}
            </motion.div>
          )}
        </div>

        {/* Ludo Board */}
        <div style={{ marginBottom: "2rem" }}>
          <LudoBoard
            team={team}
            playerId={playerId}
            onPawnClick={handlePawnClick}
            isGameStarted={true}
          />
        </div>

        {/* New Round Button */}
        <motion.button
          className="btn"
          style={{
            width: "100%",
            background: "rgba(251, 191, 36, 0.2)",
            border: "2px solid var(--warning-color)",
            color: "var(--warning-color)",
          }}
          onClick={onNewRound}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          🔄 New Round
        </motion.button>
      </motion.div>
    </div>
  );
};

export default LudoGame;
