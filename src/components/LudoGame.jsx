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
  onBackToSelection,
}) => {
  const [selectedPawn, setSelectedPawn] = useState(null);
  const [skipCountdown, setSkipCountdown] = useState(null);
  const [diceWarning, setDiceWarning] = useState(false);
  const [playAlarm, setPlayAlarm] = useState(false);
  const alarmAudioRef = React.useRef(null);

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
      // Start countdown from 1.5 seconds
      setSkipCountdown(1.5);

      const countdownInterval = setInterval(() => {
        setSkipCountdown((prev) => {
          if (prev <= 0.5) {
            clearInterval(countdownInterval);
            onSkipTurn();
            return null;
          }
          return prev - 0.5;
        });
      }, 500);

      return () => clearInterval(countdownInterval);
    } else {
      setSkipCountdown(null);
    }
  }, [isMyTurn, team.diceValue, hasValidMoves, onSkipTurn]);

  // Track inactivity on dice roll
  useEffect(() => {
    if (isMyTurn && !team.diceValue) {
      // Reset warning and alarm states
      setDiceWarning(false);
      setPlayAlarm(false);

      // Set timer for 5 seconds - show red warning
      const warningTimer = setTimeout(() => {
        setDiceWarning(true);
      }, 5000);

      // Set timer for 10 seconds - play alarm
      const alarmTimer = setTimeout(() => {
        setPlayAlarm(true);
      }, 10000);

      return () => {
        clearTimeout(warningTimer);
        clearTimeout(alarmTimer);
        setDiceWarning(false);
        setPlayAlarm(false);
      };
    } else {
      setDiceWarning(false);
      setPlayAlarm(false);
    }
  }, [isMyTurn, team.diceValue]);

  // Handle alarm sound
  useEffect(() => {
    if (playAlarm && alarmAudioRef.current) {
      alarmAudioRef.current.volume = 0.5; // Set volume to 50%
      alarmAudioRef.current.loop = true;
      alarmAudioRef.current
        .play()
        .catch((e) => console.error("Alarm play error:", e));
    } else if (alarmAudioRef.current) {
      alarmAudioRef.current.pause();
      alarmAudioRef.current.currentTime = 0;
    }

    return () => {
      if (alarmAudioRef.current) {
        alarmAudioRef.current.pause();
        alarmAudioRef.current.currentTime = 0;
      }
    };
  }, [playAlarm]);

  return (
    <div className="container" style={{ paddingTop: "6rem" }}>
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
        className="card"
        style={{ marginTop: "1rem", maxWidth: "800px", margin: "1rem auto" }}
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

        {/* Dice Section - Roll Button or Dice Value */}
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
                  ? diceWarning
                    ? "linear-gradient(135deg, #ef4444, #dc2626)"
                    : "linear-gradient(135deg, #10b981, #059669)"
                  : "rgba(100, 100, 100, 0.5)",
                fontSize: "1.5rem",
                padding: "1.5rem 3rem",
                cursor: isMyTurn ? "pointer" : "not-allowed",
                boxShadow:
                  diceWarning && isMyTurn
                    ? "0 0 20px rgba(239, 68, 68, 0.8)"
                    : "none",
              }}
              onClick={handleRollDice}
              disabled={!isMyTurn}
              whileHover={isMyTurn ? { scale: 1.05 } : {}}
              whileTap={isMyTurn ? { scale: 0.95 } : {}}
              animate={
                isMyTurn
                  ? diceWarning
                    ? { y: [0, -8, 0], scale: [1, 1.05, 1] }
                    : { y: [0, -8, 0] }
                  : {}
              }
              transition={{
                duration: diceWarning ? 0.4 : 0.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {isMyTurn
                ? "🎲 Roll Dice"
                : `⏳ ${currentPlayer?.name}'s turn...`}
            </motion.button>
          ) : (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              style={{
                fontSize: "1.5rem",
                background: isMyTurn
                  ? "linear-gradient(135deg, #10b981, #059669)"
                  : "var(--card-bg)",
                borderRadius: "12px",
                padding: "1.5rem 3rem",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: isMyTurn
                  ? "0 8px 20px rgba(16, 185, 129, 0.3)"
                  : "0 8px 20px rgba(0, 0, 0, 0.3)",
                color: "white",
                fontWeight: "bold",
                minWidth: "200px",
                border: isMyTurn ? "none" : "1px solid var(--border-color)",
              }}
            >
              {isMyTurn
                ? `🎲 ${team.diceValue}`
                : `${currentPlayer?.name} rolled: ${team.diceValue}`}
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

      {/* Alarm sound for dice roll timeout */}
      <audio ref={alarmAudioRef} preload="auto" style={{ display: "none" }}>
        <source
          src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
          type="audio/mpeg"
        />
      </audio>
    </div>
  );
};

export default LudoGame;
