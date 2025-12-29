import React, { useState, useEffect } from "react";
import GameSelection from "./components/GameSelection";
import Home from "./components/Home";
import Lobby from "./components/Lobby";
import Game from "./components/Game";
import ImposterReveal from "./components/ImposterReveal";
import LudoHome from "./components/LudoHome";
import LudoLobby from "./components/LudoLobby";
import LudoGame from "./components/LudoGame";
import ErrorPopup from "./components/ErrorPopup";
import socketService from "./services/socketService";
import "./index.css";

function App() {
  const [selectedGame, setSelectedGame] = useState(null); // null, 'ludo', 'uno', 'imposter'
  const [gameState, setGameState] = useState("home"); // home, lobby, playing, revealing

  // Imposter game state
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
  const [activeSpeakers, setActiveSpeakers] = useState([]); // Track all active speakers

  // Ludo game state
  const [ludoTeamId, setLudoTeamId] = useState(null);
  const [ludoPlayerId, setLudoPlayerId] = useState(null);
  const [ludoTeam, setLudoTeam] = useState(null);
  const [hasValidMoves, setHasValidMoves] = useState(true);

  // Shared state
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
      setActiveSpeakers([]);
    });

    // Voice chat events
    socket.on("active-speakers-updated", (data) => {
      setActiveSpeakers(data.activeSpeakers);
    });

    // Error handling
    socket.on("error", (error) => {
      setErrorMessage(error.message);
    });

    // Ludo game events
    socket.on("ludo-team-created", (data) => {
      console.log("Ludo team created:", data.team);
      setLudoTeamId(data.teamId);
      setLudoPlayerId(data.playerId);
      setLudoTeam(data.team);
      setGameState("lobby");
    });

    socket.on("ludo-team-joined", (data) => {
      console.log("Ludo team joined:", data);
      setLudoTeamId(data.teamId);
      setLudoPlayerId(data.playerId);
      setLudoTeam(data.team);
      setGameState("lobby");
    });

    socket.on("ludo-team-updated", (updatedTeam) => {
      console.log("Ludo team updated:", updatedTeam);
      setLudoTeam(updatedTeam);
    });

    socket.on("ludo-game-started", (data) => {
      console.log("Ludo game started:", data);
      setLudoTeam(data.team);
      setGameState("playing");
    });

    socket.on("ludo-dice-rolled", (data) => {
      console.log("Dice rolled:", data);
      setLudoTeam(data.team);
      setHasValidMoves(data.hasValidMoves);
    });

    socket.on("ludo-turn-skipped", (data) => {
      console.log("Turn skipped:", data);
      setLudoTeam(data.team);
      setHasValidMoves(true);
    });

    socket.on("ludo-pawn-moved", (data) => {
      console.log("Pawn moved:", data);
      setLudoTeam(data.team);
      setHasValidMoves(true);
    });

    socket.on("ludo-new-round-vote", (data) => {
      console.log("New round vote received:", data);
      setLudoTeam(data.team);
    });

    socket.on("ludo-round-reset", (data) => {
      console.log("Ludo round reset:", data);
      setLudoTeam(data.team);
      setGameState("lobby");
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
      socket.off("ludo-team-created");
      socket.off("ludo-team-joined");
      socket.off("ludo-team-updated");
      socket.off("ludo-game-started");
      socket.off("ludo-dice-rolled");
      socket.off("ludo-pawn-moved");
      socket.off("ludo-turn-skipped");
      socket.off("ludo-new-round-vote");
      socket.off("ludo-round-reset");
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

  const handleSelectGame = (gameId) => {
    setSelectedGame(gameId);
  };

  // Ludo game handlers
  const handleLudoCreateTeam = (teamName, playerName) => {
    socketService.emit("ludo-create-team", { teamName, playerName });
  };

  const handleLudoJoinTeam = (teamId, playerName) => {
    socketService.emit("ludo-join-team", { teamId, playerName });
  };

  const handleLudoStartGame = () => {
    socketService.emit("ludo-start-game", { teamId: ludoTeamId });
  };

  const handleLudoRollDice = () => {
    socketService.emit("ludo-roll-dice", {
      teamId: ludoTeamId,
      playerId: ludoPlayerId,
    });
  };

  const handleLudoMovePawn = (pawnIndex) => {
    socketService.emit("ludo-move-pawn", {
      teamId: ludoTeamId,
      playerId: ludoPlayerId,
      pawnIndex,
    });
  };

  const handleLudoNewRound = () => {
    socketService.emit("ludo-new-round", {
      teamId: ludoTeamId,
      playerId: ludoPlayerId,
    });
  };

  const handleLudoSkipTurn = () => {
    socketService.emit("ludo-skip-turn", {
      teamId: ludoTeamId,
      playerId: ludoPlayerId,
    });
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

      {/* Game Selection - First Screen */}
      {!selectedGame && <GameSelection onSelectGame={handleSelectGame} />}

      {/* Imposter Game Flow */}
      {selectedGame === "imposter" && (
        <>
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
              playerId={playerId}
              activeSpeakers={activeSpeakers}
              onRevealVote={handleRevealVote}
              revealProgress={revealProgress}
              onNewRound={handleNewRound}
            />
          )}
        </>
      )}

      {/* Ludo Game Flow */}
      {selectedGame === "ludo" && (
        <>
          {gameState === "home" && (
            <LudoHome
              onCreateTeam={handleLudoCreateTeam}
              onJoinTeam={handleLudoJoinTeam}
            />
          )}

          {gameState === "lobby" && (
            <LudoLobby team={ludoTeam} onStartGame={handleLudoStartGame} />
          )}

          {gameState === "playing" && (
            <LudoGame
              team={ludoTeam}
              playerId={ludoPlayerId}
              onRollDice={handleLudoRollDice}
              onMovePawn={handleLudoMovePawn}
              onNewRound={handleLudoNewRound}
              onSkipTurn={handleLudoSkipTurn}
              hasValidMoves={hasValidMoves}
            />
          )}
        </>
      )}

      {/* Developer Credit */}
      <div className="developer-credit">Developed by Dima</div>
    </div>
  );
}

export default App;
