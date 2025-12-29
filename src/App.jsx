import React, { useState, useEffect } from "react";
import Home from "./components/Home";
import Lobby from "./components/Lobby";
import Game from "./components/Game";
import ImposterReveal from "./components/ImposterReveal";
import ErrorPopup from "./components/ErrorPopup";
import socketService from "./services/socketService";
import "./index.css";

function App() {
  const [gameState, setGameState] = useState("home"); // home, lobby, playing, revealing
  const [teamId, setTeamId] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [team, setTeam] = useState(null);
  const [word, setWord] = useState(null);
  const [isImposter, setIsImposter] = useState(false);
  const [revealProgress, setRevealProgress] = useState({
    revealedCount: 0,
    totalPlayers: 0,
  });
  const [showReveal, setShowReveal] = useState(false);
  const [onlinePlayers, setOnlinePlayers] = useState(0);
  const [activeTeams, setActiveTeams] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const socket = socketService.connect();

    // Online players count
    socket.on("online-count", (count) => {
      setOnlinePlayers(count);
    });

    // Active teams count
    socket.on("teams-count", (count) => {
      console.log("Received teams-count:", count);
      setActiveTeams(count);
    });

    // Team created
    socket.on("team-created", (data) => {
      console.log("Team created successfully:", data.team);
      setTeamId(data.teamId);
      setPlayerId(data.playerId);
      setTeam(data.team);
      setGameState("lobby");
    });

    // Team joined
    socket.on("team-joined", (data) => {
      setTeamId(data.teamId);
      setPlayerId(data.playerId);
      setTeam(data.team);
      setGameState("lobby");
    });

    // Team updated
    socket.on("team-updated", (updatedTeam) => {
      setTeam(updatedTeam);
      // Check if we need to reset from playing to lobby
      setGameState((currentState) => {
        if (updatedTeam.gameState === "lobby" && currentState === "playing") {
          setWord(null);
          setIsImposter(false);
          setRevealProgress({ revealedCount: 0, totalPlayers: 0 });
          return "lobby";
        }
        return currentState;
      });
    });

    // Game started
    socket.on("game-started", (data) => {
      setWord(data.word);
      setIsImposter(data.isImposter);
      setGameState("playing");
      setRevealProgress({ revealedCount: 0, totalPlayers: 0 });
    });

    // Reveal progress
    socket.on("reveal-progress", (data) => {
      setRevealProgress(data);
    });

    // Reveal imposter
    socket.on("reveal-imposter", (data) => {
      setShowReveal(true);
      setIsImposter(data.isImposter);

      setTimeout(() => {
        setShowReveal(false);
      }, 5000);
    });

    // Round reset
    socket.on("round-reset", (resetTeam) => {
      setTeam(resetTeam);
      setGameState("lobby");
      setWord(null);
      setIsImposter(false);
      setRevealProgress({ revealedCount: 0, totalPlayers: 0 });
      setShowReveal(false);
    });

    // Error handling
    socket.on("error", (error) => {
      setErrorMessage(error.message);
    });

    return () => {
      // Don't disconnect, just remove listeners
      socket.off("online-count");
      socket.off("teams-count");
      socket.off("team-created");
      socket.off("team-joined");
      socket.off("team-updated");
      socket.off("game-started");
      socket.off("reveal-progress");
      socket.off("reveal-imposter");
      socket.off("round-reset");
      socket.off("error");
    };
  }, []); // Empty dependency array - only run once on mount

  const handleCreateTeam = (teamName, playerName) => {
    socketService.emit("create-team", { teamName, playerName });
  };

  const handleJoinTeam = (teamNameOrId, playerName) => {
    // If it's already formatted as a team ID (lowercase with dashes), use it directly
    // Otherwise, format it
    let teamId = teamNameOrId;
    console.log("Original input:", teamNameOrId);
    if (
      !teamNameOrId.includes("-") ||
      teamNameOrId !== teamNameOrId.toLowerCase()
    ) {
      teamId = teamNameOrId.toLowerCase().replace(/\s+/g, "-");
      console.log("Formatted teamId:", teamId);
    } else {
      console.log("Using teamId as-is:", teamId);
    }
    console.log("Final teamId sent to server:", teamId);
    socketService.emit("join-team", { teamId, playerName });
  };

  const handleStartGame = () => {
    socketService.emit("start-game", { teamId });
  };

  const handleRevealVote = () => {
    socketService.emit("reveal-vote", { teamId, playerId });
  };

  const handleNewRound = () => {
    socketService.emit("new-round", { teamId });
  };

  return (
    <div className="App">
      {/* Online Players Counter */}
      <div className="online-counter">
        <div className="counter-item">
          <span className="online-dot"></span>
          <span className="online-count">{onlinePlayers} Online</span>
        </div>
        <div className="counter-divider"></div>
        <div className="counter-item">
          <span className="team-icon">🎮</span>
          <span className="online-count">{activeTeams} Teams</span>
        </div>
      </div>

      {showReveal && <ImposterReveal isImposter={isImposter} />}

      {/* Error Popup */}
      <ErrorPopup
        message={errorMessage}
        onClose={() => setErrorMessage(null)}
      />

      {gameState === "home" && (
        <Home onCreateTeam={handleCreateTeam} onJoinTeam={handleJoinTeam} />
      )}

      {gameState === "lobby" && (
        <Lobby team={team} onStartGame={handleStartGame} />
      )}

      {gameState === "playing" && (
        <Game
          word={word}
          isImposter={isImposter}
          team={team}
          onRevealVote={handleRevealVote}
          revealProgress={revealProgress}
          onNewRound={handleNewRound}
        />
      )}

      {/* Developer Credit */}
      <div className="developer-credit">Developed by Dima</div>
    </div>
  );
}

export default App;
