import React, { useState, useEffect } from "react";
import Home from "./components/Home";
import Lobby from "./components/Lobby";
import Game from "./components/Game";
import ImposterReveal from "./components/ImposterReveal";
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

  useEffect(() => {
    const socket = socketService.connect();

    // Team created
    socket.on("team-created", (data) => {
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
      if (updatedTeam.gameState === "lobby" && gameState === "playing") {
        setGameState("lobby");
        setWord(null);
        setIsImposter(false);
        setRevealProgress({ revealedCount: 0, totalPlayers: 0 });
      }
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
      alert(error.message);
    });

    return () => {
      socketService.disconnect();
    };
  }, [gameState]);

  const handleCreateTeam = (teamName, playerName) => {
    socketService.emit("create-team", { teamName, playerName });
  };

  const handleJoinTeam = (teamNameOrId, playerName) => {
    // If it's already formatted as a team ID (lowercase with dashes), use it directly
    // Otherwise, format it
    let teamId = teamNameOrId;
    if (
      !teamNameOrId.includes("-") ||
      teamNameOrId !== teamNameOrId.toLowerCase()
    ) {
      teamId = teamNameOrId.toLowerCase().replace(/\s+/g, "-");
    }
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
      {showReveal && <ImposterReveal isImposter={isImposter} />}

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
    </div>
  );
}

export default App;
