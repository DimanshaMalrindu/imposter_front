import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LudoBoard from "./LudoBoard";
import VoiceChat from "./VoiceChat";
import socketService from "../services/socketService";

const LudoGame = ({
  team,
  playerId,
  onRollDice,
  onMovePawn,
  onNewRound,
  onSkipTurn,
  hasValidMoves,
  activeSpeakers,
}) => {
  const [selectedPawn, setSelectedPawn] = useState(null);
  const [skipCountdown, setSkipCountdown] = useState(null);

  if (!team) return null;

  const currentPlayer = team.players.find((p) => p.id === team.currentTurn);
  const myPlayer = team.players.find((p) => p.id === playerId);
  const isMyTurn = team.currentTurn === playerId;

  // Check if current player has voted for new round
  const hasVoted = team.newRoundVotes && team.newRoundVotes.includes(playerId);
  const votesCount = team.newRoundVotes ? team.newRoundVotes.length : 0;
  const totalPlayers = team.players.length;
  const votesNeeded = totalPlayers - votesCount;

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

  // Auto-skip turn if no valid moves
  useEffect(() => {
    if (isMyTurn && team.diceValue && hasValidMoves === false) {
      // Start countdown from 3 seconds
      setSkipCountdown(3);

      const countdownInterval = setInterval(() => {
        setSkipCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            onSkipTurn();
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownInterval);
    } else {
      setSkipCountdown(null);
    }
  }, [isMyTurn, team.diceValue, hasValidMoves, onSkipTurn]);

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
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "1rem",
            }}
          >
            🎲 Ludo Game in Progress
            {myPlayer && (
              <span
                style={{
                  fontSize: "1.2rem",
                  background: colorStyles[myPlayer.color].bg,
                  color: colorStyles[myPlayer.color].text,
                  border: `2px solid ${colorStyles[myPlayer.color].border}`,
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  fontWeight: "bold",
                }}
              >
                You: {myPlayer.color.toUpperCase()}
              </span>
            )}
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

          {/* Show dice value in current turn area */}
          {team.diceValue && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              style={{
                marginTop: "1rem",
                fontSize: "3rem",
                background: "linear-gradient(135deg, #10b981, #059669)",
                borderRadius: "12px",
                padding: "1rem",
                display: "inline-block",
                boxShadow: "0 8px 20px rgba(16, 185, 129, 0.3)",
              }}
            >
              🎲 {team.diceValue}
            </motion.div>
          )}
        </div>

        {/* No Valid Moves Warning */}
        {skipCountdown !== null && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: "1rem",
              background: "rgba(239, 68, 68, 0.2)",
              border: "2px solid #ef4444",
              borderRadius: "12px",
              marginBottom: "1rem",
              textAlign: "center",
              color: "#ef4444",
              fontSize: "1.2rem",
              fontWeight: "bold",
            }}
          >
            ⚠️ No valid moves available! Skipping turn in {skipCountdown}...
          </motion.div>
        )}

        {/* Dice Section - Roll Button */}
        {!team.diceValue && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "1rem",
              marginBottom: "2rem",
            }}
          >
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
          </div>
        )}

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
            background: hasVoted
              ? "rgba(16, 185, 129, 0.2)"
              : "rgba(251, 191, 36, 0.2)",
            border: hasVoted
              ? "2px solid var(--success-color)"
              : "2px solid var(--warning-color)",
            color: hasVoted ? "var(--success-color)" : "var(--warning-color)",
            cursor: hasVoted ? "not-allowed" : "pointer",
          }}
          onClick={onNewRound}
          disabled={hasVoted}
          whileHover={!hasVoted ? { scale: 1.02 } : {}}
          whileTap={!hasVoted ? { scale: 0.98 } : {}}
        >
          {hasVoted
            ? `✓ Voted for New Round (${votesCount}/${totalPlayers})`
            : `🔄 Vote for New Round (${votesCount}/${totalPlayers})`}
        </motion.button>

        {votesNeeded > 0 && votesCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: "1rem",
              padding: "0.75rem",
              background: "rgba(251, 191, 36, 0.1)",
              border: "1px solid var(--warning-color)",
              borderRadius: "8px",
              textAlign: "center",
              color: "var(--warning-color)",
              fontSize: "0.9rem",
            }}
          >
            ⏳ Waiting for {votesNeeded} more{" "}
            {votesNeeded === 1 ? "player" : "players"} to vote...
          </motion.div>
        )}
      </motion.div>

      {/* Voice Chat */}
      <VoiceChat
        socket={socketService.getSocket()}
        teamId={team.id}
        playerId={playerId}
        team={team}
        activeSpeakers={activeSpeakers}
      />
    </div>
  );
};

export default LudoGame;
