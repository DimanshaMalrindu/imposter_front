import React from "react";
import { motion } from "framer-motion";

const GameSelection = ({ onSelectGame }) => {
  const games = [
    {
      id: "ludo",
      name: "Ludo",
      icon: "🎲",
      color: "#10b981",
      status: "Coming Soon",
    },
    {
      id: "uno",
      name: "UNO",
      icon: "🃏",
      color: "#f59e0b",
      status: "Coming Soon",
    },
    {
      id: "imposter",
      name: "Imposter",
      icon: "🎭",
      color: "#8b5cf6",
      status: "Available",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="container">
      {/* Animated background particles */}
      <div className="particles">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${Math.random() * 10 + 15}s`,
            }}
          />
        ))}
      </div>

      <motion.div
        className="game-selection-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <h1 className="game-selection-title">🎲 Board Games</h1>
          <p className="game-selection-subtitle">
            Choose your favorite game to play with friends!
          </p>
        </motion.div>

        <motion.div className="games-grid" variants={itemVariants}>
          {games.map((game) => (
            <motion.div
              key={game.id}
              className={`game-card ${
                game.status === "Coming Soon" ? "disabled" : ""
              }`}
              whileHover={
                game.status === "Available"
                  ? { scale: 1.05, y: -10 }
                  : { scale: 1.02 }
              }
              whileTap={game.status === "Available" ? { scale: 0.95 } : {}}
              onClick={() =>
                game.status === "Available" && onSelectGame(game.id)
              }
              style={{
                background: `linear-gradient(135deg, ${game.color}22 0%, ${game.color}11 100%)`,
                borderColor: `${game.color}66`,
              }}
            >
              <div className="game-icon" style={{ color: game.color }}>
                {game.icon}
              </div>
              <h2 className="game-name">{game.name}</h2>
              <div
                className={`game-status ${
                  game.status === "Available" ? "available" : "coming-soon"
                }`}
              >
                {game.status}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default GameSelection;
