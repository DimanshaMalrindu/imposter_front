import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import VoiceChat from "./VoiceChat";
import socketService from "../services/socketService";

const UnoGame = ({
  team,
  playerId,
  onPlayCard,
  onDrawCard,
  onCallUno,
  onCatchUnoFailure,
  onNewRound,
  activeSpeakers,
  onBackToSelection,
}) => {
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  if (!team) return null;

  const currentPlayer = team.players.find((p) => p.id === team.currentTurn);
  const myPlayer = team.players.find((p) => p.id === playerId);
  const isMyTurn = team.currentTurn === playerId;
  const hasVoted = team.newRoundVotes && team.newRoundVotes.includes(playerId);

  // Check if I can/should call UNO (when I have 2 cards)
  const canCallUno =
    myPlayer && myPlayer.hand.length === 2 && !myPlayer.hasCalledUno;
  const hasCalledUno = myPlayer && myPlayer.hasCalledUno;

  const getCardColor = (card) => {
    if (card.color === "wild") return "#2d3748";
    const colors = {
      red: "#ef4444",
      blue: "#3b82f6",
      green: "#10b981",
      yellow: "#fbbf24",
    };
    return colors[card.color] || "#6b7280";
  };

  const getCardDisplay = (card) => {
    if (card.value === "skip") return "🚫";
    if (card.value === "reverse") return "🔄";
    if (card.value === "draw2") return "+2";
    if (card.value === "wild") return "🌈";
    if (card.value === "draw4") return "+4";
    return card.value;
  };

  const canPlayCard = (card) => {
    if (!isMyTurn) return false;

    // If there's a draw stack, can only play matching draw cards
    if (team.drawStack > 0) {
      if (team.currentCard.value === "draw2" && card.value !== "draw2") {
        return false;
      }
      if (team.currentCard.value === "draw4" && card.value !== "draw4") {
        return false;
      }
    }

    // Wild cards can always be played
    if (card.type === "wild") return true;

    // Match color or value
    return (
      card.color === team.currentColor || card.value === team.currentCard.value
    );
  };

  const handleCardClick = (cardIndex) => {
    if (!isMyTurn) return;

    const card = myPlayer.hand[cardIndex];
    if (!canPlayCard(card)) {
      return;
    }

    setSelectedCardIndex(cardIndex);

    // If it's a wild card, show color picker
    if (card.type === "wild") {
      setShowColorPicker(true);
    } else {
      onPlayCard(cardIndex, null);
      setSelectedCardIndex(null);
    }
  };

  const handleColorChoice = (color) => {
    if (selectedCardIndex !== null) {
      onPlayCard(selectedCardIndex, color);
      setSelectedCardIndex(null);
      setShowColorPicker(false);
    }
  };

  const handleDrawCard = () => {
    if (isMyTurn) {
      onDrawCard();
    }
  };

  const handleCallUno = () => {
    if (canCallUno) {
      onCallUno();
    }
  };

  const handleCatchPlayer = (targetPlayerId) => {
    onCatchUnoFailure(targetPlayerId);
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
        style={{ marginTop: "2rem", maxWidth: "1200px", margin: "2rem auto" }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "2rem",
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            🃏 UNO Game
          </h2>
        </div>

        {/* Voice Chat */}
        {team.gameState === "playing" && (
          <div style={{ marginBottom: "2rem" }}>
            <VoiceChat
              socket={socketService.getSocket()}
              teamId={team.id}
              playerId={playerId}
              team={team}
              activeSpeakers={activeSpeakers}
              eventPrefix="uno"
            />
          </div>
        )}

        {/* Game Over */}
        {team.gameState === "ended" && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: "2rem",
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              borderRadius: "12px",
              textAlign: "center",
              marginBottom: "2rem",
            }}
          >
            <h2 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
              🎉 Game Over!
            </h2>
            <p style={{ fontSize: "1.5rem", marginBottom: "2rem" }}>
              Winner:{" "}
              {team.players.find((p) => p.hand.length === 0)?.name || "Unknown"}
            </p>
            <motion.button
              className="btn btn-primary"
              onClick={onNewRound}
              disabled={hasVoted}
              style={{
                background: hasVoted
                  ? "rgba(255, 255, 255, 0.3)"
                  : "rgba(255, 255, 255, 0.9)",
                color: hasVoted ? "rgba(255, 255, 255, 0.7)" : "#f59e0b",
                fontSize: "1.2rem",
                padding: "1rem 2rem",
              }}
              whileHover={!hasVoted ? { scale: 1.05 } : {}}
              whileTap={!hasVoted ? { scale: 0.95 } : {}}
            >
              {hasVoted
                ? `Waiting for others... (${team.newRoundVotes.length}/${team.players.length})`
                : "Play Again"}
            </motion.button>
          </motion.div>
        )}

        {/* Current Turn & Card */}
        {team.gameState === "playing" && (
          <div style={{ marginBottom: "2rem" }}>
            <div
              style={{
                padding: "1.5rem",
                background: "rgba(245, 158, 11, 0.1)",
                borderRadius: "12px",
                border: "2px solid rgba(245, 158, 11, 0.3)",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontSize: "1rem",
                  color: "var(--text-secondary)",
                  marginBottom: "0.5rem",
                }}
              >
                Current Turn
              </p>
              <p
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "#f59e0b",
                  marginBottom: "1.5rem",
                }}
              >
                {currentPlayer?.name || "Unknown"} {isMyTurn && "(You)"}
              </p>

              {/* Current Card */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "2rem",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--text-secondary)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Current Card
                  </p>
                  <motion.div
                    style={{
                      width: "100px",
                      height: "140px",
                      background: team.currentCard
                        ? getCardColor(team.currentCard)
                        : "#6b7280",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "2.5rem",
                      fontWeight: "bold",
                      color: "white",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
                      border: "3px solid rgba(255, 255, 255, 0.3)",
                    }}
                    animate={{ rotate: [0, -5, 5, 0] }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      repeatDelay: 2,
                    }}
                  >
                    {team.currentCard ? getCardDisplay(team.currentCard) : "?"}
                  </motion.div>
                </div>

                {team.drawStack > 0 && (
                  <div
                    style={{
                      padding: "1rem",
                      background: "rgba(239, 68, 68, 0.2)",
                      borderRadius: "12px",
                      border: "2px solid #ef4444",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "1.2rem",
                        color: "#ef4444",
                        fontWeight: "bold",
                      }}
                    >
                      Draw Stack: +{team.drawStack}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Other Players */}
        {team.gameState === "playing" && (
          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
              Other Players
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "1rem",
              }}
            >
              {team.players
                .filter((p) => p.id !== playerId)
                .map((player) => {
                  const cardCount = player.hand.length;
                  const displayCards = Math.min(cardCount, 5);
                  const remainingCards = cardCount - 5;

                  // Generate avatar based on player name
                  const avatarEmojis = [
                    "👤",
                    "👨",
                    "👩",
                    "🧑",
                    "👱",
                    "👴",
                    "👵",
                    "🧔",
                    "🧓",
                  ];
                  const avatarIndex =
                    player.name.charCodeAt(0) % avatarEmojis.length;
                  const avatar = avatarEmojis[avatarIndex];

                  return (
                    <div
                      key={player.id}
                      style={{
                        padding: "1rem",
                        background:
                          player.id === team.currentTurn
                            ? "rgba(245, 158, 11, 0.2)"
                            : "rgba(255, 255, 255, 0.05)",
                        borderRadius: "12px",
                        border: `2px solid ${
                          player.id === team.currentTurn
                            ? "#f59e0b"
                            : "rgba(255, 255, 255, 0.1)"
                        }`,
                      }}
                    >
                      {/* Player Avatar and Name */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          marginBottom: "1rem",
                        }}
                      >
                        <div
                          style={{
                            width: "50px",
                            height: "50px",
                            borderRadius: "50%",
                            background:
                              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.8rem",
                            border: "3px solid rgba(255, 255, 255, 0.3)",
                          }}
                        >
                          {avatar}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p
                            style={{
                              fontSize: "1.1rem",
                              fontWeight: "bold",
                              marginBottom: "0.2rem",
                            }}
                          >
                            {player.name}
                          </p>
                          <p
                            style={{
                              fontSize: "0.85rem",
                              color: "var(--text-secondary)",
                            }}
                          >
                            {cardCount} {cardCount === 1 ? "card" : "cards"}
                          </p>
                        </div>
                      </div>

                      {/* Face-down cards display */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          marginBottom: "1rem",
                          minHeight: "60px",
                          padding: "0.5rem",
                          background: "rgba(0, 0, 0, 0.2)",
                          borderRadius: "8px",
                          overflowX: "auto",
                        }}
                      >
                        {/* Show up to 5 cards */}
                        {[...Array(displayCards)].map((_, index) => (
                          <div
                            key={index}
                            style={{
                              minWidth: "35px",
                              width: "35px",
                              height: "50px",
                              background:
                                "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)",
                              borderRadius: "4px",
                              border: "2px solid rgba(255, 255, 255, 0.3)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "1.2rem",
                              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
                            }}
                          >
                            🃏
                          </div>
                        ))}

                        {/* Show +N if more than 5 cards */}
                        {remainingCards > 0 && (
                          <div
                            style={{
                              minWidth: "35px",
                              padding: "0 0.5rem",
                              height: "50px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "1rem",
                              fontWeight: "bold",
                              color: "#f59e0b",
                            }}
                          >
                            +{remainingCards}
                          </div>
                        )}
                      </div>

                      {/* Always show catch button */}
                      <motion.button
                        className="btn"
                        style={{
                          width: "100%",
                          background:
                            player.hand.length === 1 &&
                            (player.failedToCallUno || !player.hasCalledUno)
                              ? "#ef4444"
                              : "rgba(255, 255, 255, 0.2)",
                          fontSize: "0.9rem",
                          padding: "0.5rem",
                          marginBottom: "0.5rem",
                          cursor:
                            player.hand.length === 1 &&
                            (player.failedToCallUno || !player.hasCalledUno)
                              ? "pointer"
                              : "not-allowed",
                        }}
                        onClick={() => handleCatchPlayer(player.id)}
                        disabled={
                          !(
                            player.hand.length === 1 &&
                            (player.failedToCallUno || !player.hasCalledUno)
                          )
                        }
                        whileHover={
                          player.hand.length === 1 &&
                          (player.failedToCallUno || !player.hasCalledUno)
                            ? { scale: 1.05 }
                            : {}
                        }
                        whileTap={
                          player.hand.length === 1 &&
                          (player.failedToCallUno || !player.hasCalledUno)
                            ? { scale: 0.95 }
                            : {}
                        }
                      >
                        🚨 Catch
                      </motion.button>

                      {player.hasCalledUno && (
                        <div
                          style={{
                            background: "rgba(245, 158, 11, 0.2)",
                            padding: "0.5rem",
                            borderRadius: "8px",
                            textAlign: "center",
                            fontSize: "0.9rem",
                            color: "#f59e0b",
                            fontWeight: "bold",
                          }}
                        >
                          ✅ UNO!
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* My Hand */}
        {team.gameState === "playing" && myPlayer && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <h3 style={{ fontSize: "1.2rem" }}>
                Your Hand ({myPlayer.hand.length} cards)
              </h3>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <motion.button
                  className="btn"
                  style={{
                    background: canCallUno
                      ? "linear-gradient(135deg, #f59e0b, #d97706)"
                      : hasCalledUno
                      ? "linear-gradient(135deg, #10b981, #059669)"
                      : "rgba(255, 255, 255, 0.2)",
                    fontSize: "1rem",
                    padding: "0.75rem 1.5rem",
                    fontWeight: "bold",
                    cursor: canCallUno ? "pointer" : "not-allowed",
                  }}
                  onClick={handleCallUno}
                  disabled={!canCallUno && !hasCalledUno}
                  whileHover={canCallUno ? { scale: 1.05 } : {}}
                  whileTap={canCallUno ? { scale: 0.95 } : {}}
                  animate={canCallUno ? { scale: [1, 1.1, 1] } : {}}
                  transition={
                    canCallUno ? { duration: 0.5, repeat: Infinity } : {}
                  }
                >
                  {hasCalledUno ? "✅ UNO Called!" : "🎯 Call UNO"}
                </motion.button>
                <motion.button
                  className="btn"
                  style={{
                    background: isMyTurn
                      ? "#3b82f6"
                      : "rgba(255, 255, 255, 0.2)",
                    fontSize: "1rem",
                    padding: "0.75rem 1.5rem",
                  }}
                  onClick={handleDrawCard}
                  disabled={!isMyTurn}
                  whileHover={isMyTurn ? { scale: 1.05 } : {}}
                  whileTap={isMyTurn ? { scale: 0.95 } : {}}
                >
                  Draw Card 🎴
                </motion.button>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                overflowX: "auto",
                padding: "1rem",
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "12px",
              }}
            >
              {myPlayer.hand.map((card, index) => {
                const playable = canPlayCard(card);
                return (
                  <motion.div
                    key={index}
                    style={{
                      minWidth: "80px",
                      width: "80px",
                      height: "120px",
                      background: getCardColor(card),
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "2rem",
                      fontWeight: "bold",
                      color: "white",
                      cursor: playable ? "pointer" : "not-allowed",
                      opacity: playable ? 1 : 0.5,
                      border:
                        selectedCardIndex === index
                          ? "3px solid white"
                          : "3px solid rgba(255, 255, 255, 0.3)",
                      boxShadow: playable
                        ? "0 4px 6px rgba(0, 0, 0, 0.3)"
                        : "none",
                    }}
                    onClick={() => handleCardClick(index)}
                    whileHover={playable ? { y: -10, scale: 1.05 } : {}}
                    whileTap={playable ? { scale: 0.95 } : {}}
                  >
                    {getCardDisplay(card)}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Color Picker Modal */}
        <AnimatePresence>
          {showColorPicker && (
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
                zIndex: 1000,
              }}
              onClick={() => setShowColorPicker(false)}
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                style={{
                  background: "#1e293b",
                  padding: "2rem",
                  borderRadius: "12px",
                  textAlign: "center",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>
                  Choose a Color
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  {["red", "blue", "green", "yellow"].map((color) => (
                    <motion.button
                      key={color}
                      className="btn"
                      style={{
                        background: getCardColor({ color }),
                        fontSize: "1.2rem",
                        padding: "1.5rem",
                        textTransform: "capitalize",
                      }}
                      onClick={() => handleColorChoice(color)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {color}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default UnoGame;
