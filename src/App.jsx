import React, { useState, useEffect } from "react";
import GameSelection from "./components/GameSelection";
import Home from "./components/Home";
import Lobby from "./components/Lobby";
import Game from "./components/Game";
import ImposterReveal from "./components/ImposterReveal";
import LudoHome from "./components/LudoHome";
import LudoLobby from "./components/LudoLobby";
import LudoGame from "./components/LudoGame";
import UnoHome from "./components/UnoHome";
import UnoLobby from "./components/UnoLobby";
import UnoGame from "./components/UnoGame";
import RejoinModal from "./components/RejoinModal";
import LoadingScreen from "./components/LoadingScreen";
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
  const [imposterName, setImposterName] = useState("");
  const [activeSpeakers, setActiveSpeakers] = useState([]); // Track all active speakers

  // Ludo game state
  const [ludoTeamId, setLudoTeamId] = useState(null);
  const [ludoPlayerId, setLudoPlayerId] = useState(null);
  const [ludoTeam, setLudoTeam] = useState(null);
  const [hasValidMoves, setHasValidMoves] = useState(true);

  // UNO game state
  const [unoTeamId, setUnoTeamId] = useState(null);
  const [unoPlayerId, setUnoPlayerId] = useState(null);
  const [unoTeam, setUnoTeam] = useState(null);

  // Shared state
  const [onlinePlayers, setOnlinePlayers] = useState(0);
  const [activeTeams, setActiveTeams] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showRejoinModal, setShowRejoinModal] = useState(false);
  const [pendingGameSelection, setPendingGameSelection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

      // Find and set imposter name from team
      if (team && data.imposterId) {
        const imposterPlayer = team.players.find(
          (p) => p.id === data.imposterId
        );
        if (imposterPlayer) {
          setImposterName(imposterPlayer.name);
        }
      }

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

    // UNO game events
    socket.on("uno-team-created", (data) => {
      console.log("UNO team created:", data.team);
      setUnoTeamId(data.teamId);
      setUnoPlayerId(data.playerId);
      setUnoTeam(data.team);
      setGameState("lobby");
    });

    socket.on("uno-team-joined", (data) => {
      console.log("UNO team joined:", data);
      setUnoTeamId(data.teamId);
      setUnoPlayerId(data.playerId);
      setUnoTeam(data.team);
      setGameState("lobby");
    });

    socket.on("uno-team-updated", (updatedTeam) => {
      console.log("UNO team updated:", updatedTeam);
      setUnoTeam(updatedTeam);
    });

    socket.on("uno-game-started", (data) => {
      console.log("UNO game started:", data);
      setUnoTeam(data.team);
      setGameState("playing");
    });

    socket.on("uno-card-played", (data) => {
      console.log("Card played:", data);
      setUnoTeam(data.team);
    });

    socket.on("uno-card-drawn", (data) => {
      console.log("Card drawn:", data);
      setUnoTeam(data.team);
    });

    socket.on("uno-turn-skipped", (data) => {
      console.log("Turn skipped:", data);
      setUnoTeam(data.team);
    });

    socket.on("uno-called", (data) => {
      console.log("UNO called by player:", data.playerId);
      setUnoTeam(data.team);
    });

    socket.on("uno-catch-result", (data) => {
      console.log("UNO catch result:", data);
      if (data.caught) {
        setUnoTeam(data.team);
      }
    });

    socket.on("uno-new-round-vote", (data) => {
      console.log("New round vote:", data);
    });

    socket.on("uno-round-reset", (data) => {
      console.log("UNO round reset:", data);
      setUnoTeam(data);
      setGameState("lobby");
    });

    socket.on("uno-active-speakers-updated", (data) => {
      setActiveSpeakers(data.activeSpeakers);
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
      socket.off("uno-team-created");
      socket.off("uno-team-joined");
      socket.off("uno-team-updated");
      socket.off("uno-game-started");
      socket.off("uno-card-played");
      socket.off("uno-card-drawn");
      socket.off("uno-turn-skipped");
      socket.off("uno-called");
      socket.off("uno-catch-result");
      socket.off("uno-new-round-vote");
      socket.off("uno-round-reset");
      socket.off("uno-active-speakers-updated");
    };
  }, []); // Empty dependency array - only run once on mount

  const handleBackToSelection = () => {
    // Reset game state and return to game selection
    setSelectedGame(null);
    setGameState("home");
    // Clear all game states
    setTeamId(null);
    setPlayerId(null);
    setTeam(null);
    setWord(null);
    setIsImposter(false);
    setRevealProgress({ revealedCount: 0, totalPlayers: 0 });
    setShowReveal(false);
    setActiveSpeakers([]);
    setLudoTeamId(null);
    setLudoPlayerId(null);
    setLudoTeam(null);
    setHasValidMoves(true);
    setUnoTeamId(null);
    setUnoPlayerId(null);
    setUnoTeam(null);
  };

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
    // Check if user already has an active game for this game type
    let hasActiveGame = false;

    if (gameId === "imposter" && teamId && playerId) {
      hasActiveGame = true;
    } else if (gameId === "ludo" && ludoTeamId && ludoPlayerId) {
      hasActiveGame = true;
    } else if (gameId === "uno" && unoTeamId && unoPlayerId) {
      hasActiveGame = true;
    }

    if (hasActiveGame) {
      // Show rejoin modal
      setPendingGameSelection(gameId);
      setShowRejoinModal(true);
    } else {
      // No active game, proceed normally
      setSelectedGame(gameId);
      setGameState("home");
    }
  };

  const handleRejoinGame = () => {
    // User wants to rejoin their existing game
    setSelectedGame(pendingGameSelection);
    setShowRejoinModal(false);
    setPendingGameSelection(null);
    // Game state is already preserved, just show the appropriate screen
  };

  const handleNewTeam = () => {
    // User wants to start fresh with a new team
    const gameId = pendingGameSelection;

    // Clear the state for this specific game
    if (gameId === "imposter") {
      setTeamId(null);
      setPlayerId(null);
      setTeam(null);
      setWord(null);
      setIsImposter(false);
      setRevealProgress({ revealedCount: 0, totalPlayers: 0 });
      setShowReveal(false);
    } else if (gameId === "ludo") {
      setLudoTeamId(null);
      setLudoPlayerId(null);
      setLudoTeam(null);
      setHasValidMoves(true);
    } else if (gameId === "uno") {
      setUnoTeamId(null);
      setUnoPlayerId(null);
      setUnoTeam(null);
    }

    setSelectedGame(gameId);
    setGameState("home");
    setShowRejoinModal(false);
    setPendingGameSelection(null);
    setActiveSpeakers([]);
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

  // UNO game handlers
  const handleUnoCreateTeam = (teamName, playerName) => {
    socketService.emit("uno-create-team", { teamName, playerName });
  };

  const handleUnoJoinTeam = (teamId, playerName) => {
    socketService.emit("uno-join-team", { teamId, playerName });
  };

  const handleUnoStartGame = () => {
    socketService.emit("uno-start-game", { teamId: unoTeamId });
  };

  const handleUnoPlayCard = (cardIndex, chosenColor) => {
    socketService.emit("uno-play-card", {
      teamId: unoTeamId,
      playerId: unoPlayerId,
      cardIndex,
      chosenColor,
    });
  };

  const handleUnoDrawCard = () => {
    socketService.emit("uno-draw-card", {
      teamId: unoTeamId,
      playerId: unoPlayerId,
    });
  };

  const handleUnoCallUno = () => {
    socketService.emit("uno-call-uno", {
      teamId: unoTeamId,
      playerId: unoPlayerId,
    });
  };

  const handleUnoCatchFailure = (targetPlayerId) => {
    socketService.emit("uno-catch-failure", {
      teamId: unoTeamId,
      accuserId: unoPlayerId,
      targetPlayerId,
    });
  };

  const handleUnoNewRound = () => {
    socketService.emit("uno-new-round", {
      teamId: unoTeamId,
      playerId: unoPlayerId,
    });
  };

  return (
    <div className="App">
      {/* Loading Screen */}
      {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}

      {/* Online Players Counter */}
      <div className="online-counter">
        <div className="counter-item">
          <span className="online-dot"></span>
          <span className="online-count">👤 {onlinePlayers}</span>
        </div>
        <div className="counter-divider"></div>
        <div className="counter-item">
          <span className="team-icon">🎮</span>
          <span className="online-count">{activeTeams}</span>
        </div>
      </div>

      {showReveal && (
        <ImposterReveal isImposter={isImposter} imposterName={imposterName} />
      )}

      {/* Error Popup */}
      <ErrorPopup
        message={errorMessage}
        onClose={() => setErrorMessage(null)}
      />

      {/* Rejoin Modal */}
      {showRejoinModal && (
        <RejoinModal
          gameName={
            pendingGameSelection === "imposter"
              ? "Imposter"
              : pendingGameSelection === "ludo"
              ? "Ludo"
              : "UNO"
          }
          onRejoin={handleRejoinGame}
          onNewTeam={handleNewTeam}
        />
      )}

      {/* Game Selection - First Screen */}
      {!selectedGame && <GameSelection onSelectGame={handleSelectGame} />}

      {/* Imposter Game Flow */}
      {selectedGame === "imposter" && (
        <>
          {gameState === "home" && (
            <Home
              onCreateTeam={handleCreateTeam}
              onJoinTeam={handleJoinTeam}
              onBackToSelection={handleBackToSelection}
            />
          )}

          {gameState === "lobby" && (
            <Lobby
              team={team}
              onStartGame={handleStartGame}
              onBackToSelection={handleBackToSelection}
            />
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
              onBackToSelection={handleBackToSelection}
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
              onBackToSelection={handleBackToSelection}
            />
          )}

          {gameState === "lobby" && (
            <LudoLobby
              team={ludoTeam}
              onStartGame={handleLudoStartGame}
              onBackToSelection={handleBackToSelection}
            />
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
              activeSpeakers={activeSpeakers}
              onBackToSelection={handleBackToSelection}
            />
          )}
        </>
      )}

      {/* UNO Game Flow */}
      {selectedGame === "uno" && (
        <>
          {gameState === "home" && (
            <UnoHome
              onCreateTeam={handleUnoCreateTeam}
              onJoinTeam={handleUnoJoinTeam}
              onBackToSelection={handleBackToSelection}
            />
          )}

          {gameState === "lobby" && (
            <UnoLobby
              team={unoTeam}
              onStartGame={handleUnoStartGame}
              onBackToSelection={handleBackToSelection}
            />
          )}

          {gameState === "playing" && (
            <UnoGame
              team={unoTeam}
              playerId={unoPlayerId}
              onPlayCard={handleUnoPlayCard}
              onDrawCard={handleUnoDrawCard}
              onCallUno={handleUnoCallUno}
              onCatchUnoFailure={handleUnoCatchFailure}
              onNewRound={handleUnoNewRound}
              activeSpeakers={activeSpeakers}
              onBackToSelection={handleBackToSelection}
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
