import React, { useState } from "react";
import { motion } from "framer-motion";

const Home = ({ onCreateTeam, onJoinTeam }) => {
  const [mode, setMode] = useState(null);
  const [teamName, setTeamName] = useState("");
  const [playerName, setPlayerName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!teamName.trim() || !playerName.trim()) {
      alert("Please fill in all fields");
      return;
    }

    if (mode === "create") {
      onCreateTeam(teamName, playerName);
    } else {
      onJoinTeam(teamName, playerName);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        when: "beforeChildren",
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
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
        className="card"
        style={{ marginTop: "4rem", maxWidth: "500px", margin: "4rem auto" }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <h1
            style={{
              fontSize: "3rem",
              textAlign: "center",
              marginBottom: "1rem",
              background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: "bold",
            }}
          >
            🎭 IMPOSTER
          </h1>
          <p
            style={{
              textAlign: "center",
              color: "var(--text-secondary)",
              marginBottom: "2rem",
              fontSize: "1.1rem",
            }}
          >
            Find the imposter among you!
          </p>
        </motion.div>

        {!mode ? (
          <motion.div variants={itemVariants}>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <motion.button
                className="btn btn-primary"
                onClick={() => setMode("create")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Create a Team
              </motion.button>
              <motion.button
                className="btn btn-primary"
                onClick={() => setMode("join")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Join a Team
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.form
            onSubmit={handleSubmit}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "600",
                  color: "var(--text-secondary)",
                }}
              >
                Your Name
              </label>
              <input
                type="text"
                className="input"
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                autoFocus
              />
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "600",
                  color: "var(--text-secondary)",
                }}
              >
                Team {mode === "create" ? "Name" : "ID"}
              </label>
              <input
                type="text"
                className="input"
                placeholder={
                  mode === "create" ? "Create a team name" : "Enter team ID"
                }
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <motion.button
                type="button"
                className="btn"
                onClick={() => {
                  setMode(null);
                  setTeamName("");
                  setPlayerName("");
                }}
                style={{
                  flex: 1,
                  background: "rgba(255, 255, 255, 0.1)",
                  color: "white",
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Back
              </motion.button>
              <motion.button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 2 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {mode === "create" ? "Create Team" : "Join Team"}
              </motion.button>
            </div>
          </motion.form>
        )}
      </motion.div>
    </div>
  );
};

export default Home;
