import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const CountdownTimer = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate - now;

      if (difference <= 0) {
        return "Available Now!";
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      if (days > 0) {
        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
      } else if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
      } else {
        return `${minutes}m ${seconds}s`;
      }
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div
      style={{
        fontSize: "0.85rem",
        color: "var(--text-secondary)",
        marginTop: "0.5rem",
        fontWeight: "500",
      }}
    >
      ⏰ {timeLeft}
    </div>
  );
};

const GameSelection = ({ onSelectGame }) => {
  // Get today's date and set specific launch times
  const today = new Date();

  // Ludo: Today at midnight (12:00 AM)
  const ludoLaunchDate = new Date(today);
  ludoLaunchDate.setHours(24, 0, 0, 0); // Next midnight

  // UNO: January 1st at 11 AM
  const unoLaunchDate = new Date(2026, 0, 1, 11, 35, 13, 27); // Month is 0-indexed

  const games = [
    {
      id: "ludo",
      name: "Ludo",
      icon: "🎲",
      color: "#10b981",
      status: "Available",
      launchDate: ludoLaunchDate,
    },
    {
      id: "uno",
      name: "UNO",
      icon: "🃏",
      color: "#f59e0b",
      status: "Coming Soon",
      launchDate: unoLaunchDate,
    },
    {
      id: "imposter",
      name: "Imposter",
      icon: "🎭",
      color: "#8b5cf6",
      status: "Available",
    },
  ];

  // Sort games: Available first (alphabetically), then Coming Soon (alphabetically)
  const sortedGames = [...games].sort((a, b) => {
    // If both have the same status, sort alphabetically by name
    if (a.status === b.status) {
      return a.name.localeCompare(b.name);
    }
    // Available games come before Coming Soon games
    return a.status === "Available" ? -1 : 1;
  });

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
          {sortedGames.map((game) => (
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
              {game.status === "Coming Soon" && game.launchDate && (
                <CountdownTimer targetDate={game.launchDate} />
              )}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default GameSelection;
