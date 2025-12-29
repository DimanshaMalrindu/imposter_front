import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import socketService from "../services/socketService";

const UnoHome = ({ onCreateTeam, onJoinTeam }) => {
  const [mode, setMode] = useState(null);
  const [teamName, setTeamName] = useState("");
  const [playerName, setPlayerName] = useState("");

  useEffect(() => {
    if (mode === "join") {
      const requestTeams = () => {
        const socket = socketService.getSocket();
        console.log("Socket status:", socket ? "connected" : "not connected");
        console.log("Socket ID:", socket?.id);

        if (socket && socket.connected) {
          console.log("Requesting available UNO teams from server...");
          socket.emit("uno-get-teams");

          const handleTeamsList = (teams) => {
            console.log("Available UNO teams received:", teams);
          };

          socket.on("uno-teams-list", handleTeamsList);

          return () => {
            socket.off("uno-teams-list", handleTeamsList);
          };
        } else {
          console.log("Socket not connected yet, retrying in 500ms...");
          setTimeout(requestTeams, 500);
        }
      };

      requestTeams();
    }
  }, [mode]);

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
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: "bold",
            }}
          >
            🃏 UNO
          </h1>
          <p
            style={{
              textAlign: "center",
              color: "var(--text-secondary)",
              marginBottom: "2rem",
              fontSize: "1.1rem",
            }}
          >
            Match colors and numbers, don't forget to call UNO!
          </p>
        </motion.div>

        {!mode ? (
          <motion.div variants={itemVariants}>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <motion.button
                className="btn btn-primary"
                style={{
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                }}
                onClick={() => setMode("create")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Create a Team
              </motion.button>
              <motion.button
                className="btn btn-primary"
                style={{
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                }}
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
                style={{
                  flex: 2,
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                }}
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

export default UnoHome;
