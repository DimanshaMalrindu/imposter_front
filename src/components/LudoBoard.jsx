import React from "react";
import { motion } from "framer-motion";

const LudoBoard = ({ team, playerId, onPawnClick, isGameStarted }) => {
  if (!team) return null;

  const colors = {
    red: "#ef4444",
    blue: "#3b82f6",
    green: "#10b981",
    yellow: "#fbbf24",
  };

  // CLASSIC LUDO BOARD - 15x15 GRID STRUCTURE
  // Based on standard Ludo board geometry

  const generateClassicLudoBoard = () => {
    const grid = Array(15)
      .fill(null)
      .map(() =>
        Array(15)
          .fill(null)
          .map(() => ({
            type: "empty",
            color: null,
            pathIndex: -1,
          }))
      );

    const pathCells = [];

    // 52-cell outer track - Red home is [6,0], start is [6,0]
    pathCells.push({ row: 6, col: 0, color: "red", type: "start" }); // 0 - red start
    pathCells.push({ row: 6, col: 1, color: null, type: "path" }); // 1
    pathCells.push({ row: 6, col: 2, color: null, type: "path" }); // 2
    pathCells.push({ row: 6, col: 3, color: null, type: "path" }); // 3
    pathCells.push({ row: 6, col: 4, color: null, type: "path" }); // 4
    pathCells.push({ row: 6, col: 5, color: null, type: "path" }); // 5
    pathCells.push({ row: 5, col: 6, color: null, type: "path" }); // 6
    pathCells.push({ row: 4, col: 6, color: null, type: "path" }); // 7
    pathCells.push({ row: 3, col: 6, color: null, type: "path" }); // 8
    pathCells.push({ row: 2, col: 6, color: null, type: "path" }); // 9
    pathCells.push({ row: 1, col: 6, color: null, type: "path" }); // 10
    pathCells.push({ row: 0, col: 6, color: null, type: "path" }); // 11
    pathCells.push({ row: 0, col: 7, color: "green", type: "path" }); // 12
    pathCells.push({ row: 0, col: 8, color: "green", type: "start" }); // 13
    pathCells.push({ row: 1, col: 8, color: null, type: "path" }); // 14
    pathCells.push({ row: 2, col: 8, color: null, type: "path" }); // 15
    pathCells.push({ row: 3, col: 8, color: null, type: "path" }); // 16
    pathCells.push({ row: 4, col: 8, color: null, type: "path" }); // 17
    pathCells.push({ row: 5, col: 8, color: null, type: "path" }); // 18
    pathCells.push({ row: 6, col: 9, color: null, type: "path" }); // 19
    pathCells.push({ row: 6, col: 10, color: null, type: "path" }); // 20
    pathCells.push({ row: 6, col: 11, color: null, type: "path" }); // 21
    pathCells.push({ row: 6, col: 12, color: null, type: "path" }); // 22
    pathCells.push({ row: 6, col: 13, color: null, type: "path" }); // 23
    pathCells.push({ row: 6, col: 14, color: null, type: "path" }); // 24
    pathCells.push({ row: 7, col: 14, color: "yellow", type: "path" }); // 25
    pathCells.push({ row: 8, col: 14, color: "yellow", type: "start" }); // 26
    pathCells.push({ row: 8, col: 13, color: null, type: "path" }); // 27
    pathCells.push({ row: 8, col: 12, color: null, type: "path" }); // 28
    pathCells.push({ row: 8, col: 11, color: null, type: "path" }); // 29
    pathCells.push({ row: 8, col: 10, color: null, type: "path" }); // 30
    pathCells.push({ row: 8, col: 9, color: null, type: "path" }); // 31
    pathCells.push({ row: 9, col: 8, color: null, type: "path" }); // 32
    pathCells.push({ row: 10, col: 8, color: null, type: "path" }); // 33
    pathCells.push({ row: 11, col: 8, color: null, type: "path" }); // 34
    pathCells.push({ row: 12, col: 8, color: null, type: "path" }); // 35
    pathCells.push({ row: 13, col: 8, color: null, type: "path" }); // 36
    pathCells.push({ row: 14, col: 8, color: null, type: "path" }); // 37
    pathCells.push({ row: 14, col: 7, color: "blue", type: "path" }); // 38
    pathCells.push({ row: 14, col: 6, color: "blue", type: "start" }); // 39
    pathCells.push({ row: 13, col: 6, color: null, type: "path" }); // 40
    pathCells.push({ row: 12, col: 6, color: null, type: "path" }); // 41
    pathCells.push({ row: 11, col: 6, color: null, type: "path" }); // 42
    pathCells.push({ row: 10, col: 6, color: null, type: "path" }); // 43
    pathCells.push({ row: 9, col: 6, color: null, type: "path" }); // 44
    pathCells.push({ row: 8, col: 5, color: null, type: "path" }); // 45
    pathCells.push({ row: 8, col: 4, color: null, type: "path" }); // 46
    pathCells.push({ row: 8, col: 3, color: null, type: "path" }); // 47
    pathCells.push({ row: 8, col: 2, color: null, type: "path" }); // 48
    pathCells.push({ row: 8, col: 1, color: null, type: "path" }); // 49
    pathCells.push({ row: 8, col: 0, color: null, type: "path" }); // 50
    pathCells.push({ row: 7, col: 0, color: "red", type: "path" }); // 51

    pathCells.forEach((cell, index) => {
      grid[cell.row][cell.col] = {
        type: cell.type,
        color: cell.color,
        pathIndex: index,
      };
    });

    // HOME STRETCH - 6 cells each leading to center
    // RED - row 7, col 1-6
    for (let col = 1; col <= 6; col++) {
      grid[7][col] = { type: "home-stretch", color: "red", pathIndex: -1 };
    }

    // GREEN - col 7, row 1-6
    for (let row = 1; row <= 6; row++) {
      grid[row][7] = { type: "home-stretch", color: "green", pathIndex: -1 };
    }

    // YELLOW - row 7, col 13-8
    for (let col = 13; col >= 8; col--) {
      grid[7][col] = { type: "home-stretch", color: "yellow", pathIndex: -1 };
    }

    // BLUE - col 7, row 13-8
    for (let row = 13; row >= 8; row--) {
      grid[row][7] = { type: "home-stretch", color: "blue", pathIndex: -1 };
    }

    // CENTER - single cell at [7,7]
    grid[7][7] = { type: "center", color: null, pathIndex: -1 };

    return { grid, pathCells };
  };

  const { grid, pathCells } = generateClassicLudoBoard();

  // Render pawn on track using path index
  const renderTrackPawn = (player, pawnIndex, position) => {
    if (position === 0) return null;
    if (!player) return null;

    // Calculate grid position based on player color and position
    const getGridPosition = (pos, playerColor) => {
      // Each player's starting position on the track
      const startingCells = {
        red: { row: 6, col: 0, pathIndex: 0 },
        green: { row: 0, col: 8, pathIndex: 13 },
        yellow: { row: 8, col: 14, pathIndex: 26 },
        blue: { row: 14, col: 6, pathIndex: 39 },
      };

      // Handle home stretch (positions 52-58)
      if (pos > 51) {
        const homePos = pos - 52; // 0-6 for home stretch positions
        if (homePos >= 0 && homePos <= 6) {
          // Define home stretch paths for each color
          const homeStretchPaths = {
            red: { row: 7, colStart: 1 }, // [7,1] to [7,7]
            green: { rowStart: 1, col: 7 }, // [1,7] to [7,7]
            yellow: { row: 7, colStart: 13 }, // [7,13] to [7,7] (going left)
            blue: { rowStart: 13, col: 7 }, // [13,7] to [7,7] (going up)
          };

          const homePath = homeStretchPaths[playerColor];
          if (playerColor === "red") {
            return { row: homePath.row, col: homePath.colStart + homePos };
          } else if (playerColor === "green") {
            return { row: homePath.rowStart + homePos, col: homePath.col };
          } else if (playerColor === "yellow") {
            return { row: homePath.row, col: homePath.colStart - homePos };
          } else if (playerColor === "blue") {
            return { row: homePath.rowStart - homePos, col: homePath.col };
          }
        }
        return null; // Beyond valid positions
      }

      // Position 1 is the starting cell for each player
      if (pos === 1) {
        return startingCells[playerColor];
      }

      // For positions 2-51, calculate from the starting position
      const startIndex = startingCells[playerColor].pathIndex;
      const cellIndex = (startIndex + pos - 1) % pathCells.length;

      if (cellIndex >= 0 && cellIndex < pathCells.length) {
        const cell = pathCells[cellIndex];
        return { row: cell.row, col: cell.col };
      }

      return null;
    };

    const gridPos = getGridPosition(position, player.color);
    if (!gridPos) return null;

    const cellSize = 100 / 15;
    const left = (gridPos.col + 0.5) * cellSize;
    const top = (gridPos.row + 0.5) * cellSize;

    // Pawn size should be smaller than cell size for better fit
    const pawnSize = cellSize * 0.7; // 70% of cell size

    const isMyPawn = player.id === playerId;
    const canMove = isGameStarted && team.currentTurn === player.id && isMyPawn;

    return (
      <div
        key={`${player.id}-${pawnIndex}-wrapper`}
        style={{
          position: "absolute",
          left: `${left}%`,
          top: `${top}%`,
          width: `${pawnSize}%`,
          height: `${pawnSize}%`,
          transform: "translate(-50%, -50%)",
        }}
      >
        <motion.div
          onClick={() =>
            isMyPawn && onPawnClick ? onPawnClick(pawnIndex) : null
          }
          style={{
            width: "100%",
            height: "100%",
            background: `radial-gradient(circle at 30% 30%, ${
              colors[player.color]
            }ff, ${colors[player.color]}dd 50%, ${colors[player.color]}88)`,
            borderRadius: "50%",
            border: isMyPawn
              ? "3px solid #ffffff"
              : "2px solid rgba(255,255,255,0.6)",
            cursor: canMove ? "pointer" : "default",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
            fontSize: "0.9rem",
            boxShadow: `0 6px 18px rgba(0,0,0,0.6), inset 0 3px 8px rgba(255,255,255,0.3), inset 0 -3px 8px rgba(0,0,0,0.4)`,
            zIndex: 20 + position,
            opacity: isMyPawn ? 1 : 0.85,
            textShadow: "0 1px 3px rgba(0,0,0,0.5)",
          }}
          whileHover={canMove ? { scale: 1.3 } : {}}
          whileTap={canMove ? { scale: 0.9 } : {}}
        >
          {isMyPawn ? '♞' : '♟'}
        </motion.div>
      </div>
    );
  };

  // Render home area with 4 pawn slots
  const renderHomeArea = (color) => {
    const playersWithColor = team.players.filter((p) => p.color === color);
    const hasPlayers = playersWithColor.length > 0;

    // Home area positions in grid (5x5 areas in corners)
    const homeAreas = {
      red: { startRow: 0, startCol: 0 },
      green: { startRow: 0, startCol: 10 },
      yellow: { startRow: 10, startCol: 10 },
      blue: { startRow: 10, startCol: 0 },
    };

    const home = homeAreas[color];
    const cellSize = 100 / 15;

    // 4 pawn slots in 2x2 arrangement within the 5x5 home
    const pawnSlots = [
      { row: home.startRow + 1.5, col: home.startCol + 1.5 },
      { row: home.startRow + 1.5, col: home.startCol + 3.5 },
      { row: home.startRow + 3.5, col: home.startCol + 1.5 },
      { row: home.startRow + 3.5, col: home.startCol + 3.5 },
    ];

    return (
      <>
        {/* Home area background */}
        <div
          style={{
            position: "absolute",
            left: `${home.startCol * cellSize}%`,
            top: `${home.startRow * cellSize}%`,
            width: `${5 * cellSize}%`,
            height: `${5 * cellSize}%`,
            background: `linear-gradient(145deg, ${colors[color]}, ${colors[color]}dd)`,
            border: `4px solid ${colors[color]}`,
            borderRadius: "12px",
            boxShadow: `inset 0 6px 15px rgba(0,0,0,0.3), inset 0 -4px 10px rgba(255,255,255,0.2), 0 4px 12px ${colors[color]}80`,
          }}
        />

        {/* Pawn slots and pawns */}
        {pawnSlots.map((slot, slotIndex) => {
          const left = (slot.col + 0.5) * cellSize;
          const top = (slot.row + 0.5) * cellSize;

          // Find pawns at home (position 0) for this slot
          const pawnsAtHome = [];
          playersWithColor.forEach((player) => {
            player.pawns.forEach((pos, pawnIdx) => {
              if (pos === 0) {
                pawnsAtHome.push({ player, pawnIdx });
              }
            });
          });

          const pawnData = pawnsAtHome[slotIndex];

          return (
            <div
              key={`${color}-slot-${slotIndex}`}
              style={{
                position: "absolute",
                left: `${left}%`,
                top: `${top}%`,
                width: "5%",
                height: "5%",
                transform: "translate(-50%, -50%)",
              }}
            >
              {pawnData ? (
                <motion.div
                  onClick={() =>
                    pawnData.player.id === playerId && onPawnClick
                      ? onPawnClick(pawnData.pawnIdx)
                      : null
                  }
                  style={{
                    width: "100%",
                    height: "100%",
                    background: `radial-gradient(circle at 30% 30%, ${colors[color]}ff, ${colors[color]}dd 50%, ${colors[color]}88)`,
                    borderRadius: "50%",
                    border:
                      pawnData.player.id === playerId
                        ? "3px solid #ffffff"
                        : "2px solid rgba(255,255,255,0.6)",
                    cursor:
                      isGameStarted && team.currentTurn === pawnData.player.id
                        ? "pointer"
                        : "default",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "0.9rem",
                    boxShadow: `0 6px 18px rgba(0,0,0,0.6), inset 0 3px 8px rgba(255,255,255,0.3), inset 0 -3px 8px rgba(0,0,0,0.4)`,
                    textShadow: "0 1px 3px rgba(0,0,0,0.5)",
                  }}
                  whileHover={
                    isGameStarted && team.currentTurn === pawnData.player.id
                      ? { scale: 1.2 }
                      : {}
                  }
                >
                  {pawnData.player.id === playerId ? '♞' : '♟'}
                </motion.div>
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: `${colors[color]}20`,
                    borderRadius: "50%",
                    border: `2px dashed ${colors[color]}60`,
                  }}
                />
              )}
            </div>
          );
        })}
      </>
    );
  };

  // Render the 15x15 grid board
  const renderBoard = () => {
    const cellSize = 100 / 15;

    return (
      <>
        {/* Render grid cells */}
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const left = colIndex * cellSize;
            const top = rowIndex * cellSize;

            let bgColor = "#fafafa";
            let borderColor = "#e0e0e0";
            let cellShadow =
              "inset 0 2px 4px rgba(0,0,0,0.1), inset 0 -1px 2px rgba(255,255,255,0.5)";
            let customBorder = null;

            // Special case for cell [6,6] - diagonal red and blue split
            if (rowIndex === 6 && colIndex === 6) {
              bgColor = `linear-gradient(45deg, ${colors.red} 50%, ${colors.green} 50%)`;
              borderColor = colors.red;
              customBorder = {
                borderTop: `2px solid ${colors.green}`,
                borderRight: `2px solid ${colors.green}`,
                borderBottom: `2px solid ${colors.red}`,
                borderLeft: `2px solid ${colors.red}`,
              };
              cellShadow =
                "inset 0 3px 6px rgba(0,0,0,0.2), inset 0 -2px 4px rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.15)";
            } else if (rowIndex === 6 && colIndex === 8) {
              bgColor = `linear-gradient(135deg, ${colors.green} 50%, ${colors.yellow} 50%)`;
              borderColor = colors.green;
              customBorder = {
                borderTop: `2px solid ${colors.green}`,
                borderRight: `2px solid ${colors.yellow}`,
                borderBottom: `2px solid ${colors.yellow}`,
                borderLeft: `2px solid ${colors.green}`,
              };
              cellShadow =
                "inset 0 3px 6px rgba(0,0,0,0.2), inset 0 -2px 4px rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.15)";
            } else if (rowIndex === 8 && colIndex === 8) {
              bgColor = `linear-gradient(225deg, ${colors.yellow} 50%, ${colors.blue} 50%)`;
              borderColor = colors.yellow;
              customBorder = {
                borderTop: `2px solid ${colors.yellow}`,
                borderRight: `2px solid ${colors.yellow}`,
                borderBottom: `2px solid ${colors.blue}`,
                borderLeft: `2px solid ${colors.blue}`,
              };
              cellShadow =
                "inset 0 3px 6px rgba(0,0,0,0.2), inset 0 -2px 4px rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.15)";
            } else if (rowIndex === 8 && colIndex === 6) {
              bgColor = `linear-gradient(135deg, ${colors.red} 50%, ${colors.blue} 50%)`;
              borderColor = colors.red;
              customBorder = {
                borderTop: `2px solid ${colors.red}`,
                borderRight: `2px solid ${colors.blue}`,
                borderBottom: `2px solid ${colors.blue}`,
                borderLeft: `2px solid ${colors.red}`,
              };
              cellShadow =
                "inset 0 3px 6px rgba(0,0,0,0.2), inset 0 -2px 4px rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.15)";
            } else if (rowIndex === 7 && colIndex === 7) {
              // Center cell - pyramid top view with all four colors
              bgColor = `conic-gradient(from 45deg, ${colors.yellow} 0deg 90deg, ${colors.blue} 90deg 180deg, ${colors.red} 180deg 270deg, ${colors.green} 270deg 360deg)`;
              borderColor = "#666";
              customBorder = {
                borderTop: `2px solid ${colors.green}`,
                borderRight: `2px solid ${colors.yellow}`,
                borderBottom: `2px solid ${colors.blue}`,
                borderLeft: `2px solid ${colors.red}`,
              };
              cellShadow =
                "inset 0 5px 10px rgba(0,0,0,0.3), inset 0 -3px 8px rgba(255,255,255,0.4), 0 4px 8px rgba(0,0,0,0.5)";
            } else if (cell.type === "path" || cell.type === "start") {
              bgColor = cell.color ? `${colors[cell.color]}` : "#fff";
              borderColor = cell.color ? colors[cell.color] : "#ccc";
              cellShadow = cell.color
                ? `inset 0 3px 6px rgba(0,0,0,0.2), inset 0 -2px 4px rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.15)`
                : "inset 0 2px 5px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.1)";
            } else if (cell.type === "safe") {
              bgColor = "#fef3c7";
              borderColor = "#f59e0b";
              cellShadow =
                "inset 0 3px 6px rgba(245,158,11,0.3), inset 0 -2px 4px rgba(255,255,255,0.6)";
            } else if (cell.type === "home-stretch") {
              bgColor = `linear-gradient(145deg, ${colors[cell.color]}ee, ${
                colors[cell.color]
              }cc)`;
              borderColor = colors[cell.color];
              cellShadow = `inset 0 2px 6px rgba(0,0,0,0.15), inset 0 -2px 4px rgba(255,255,255,0.4), 0 1px 3px ${
                colors[cell.color]
              }60`;
            } else if (cell.type === "center") {
              bgColor = "linear-gradient(145deg, #fbbf24, #f59e0b)";
              borderColor = "#dc2626";
              cellShadow =
                "inset 0 5px 10px rgba(0,0,0,0.3), inset 0 -3px 8px rgba(255,255,255,0.4), 0 4px 8px rgba(220,38,38,0.5)";
            } else if (cell.type === "empty") {
              // Empty cells - no border
              borderColor = "transparent";
              cellShadow = "none";
            }

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                style={{
                  position: "absolute",
                  left: `${left}%`,
                  top: `${top}%`,
                  width: `${cellSize}%`,
                  height: `${cellSize}%`,
                  background: bgColor,
                  ...(customBorder || { border: `2px solid ${borderColor}` }),
                  boxShadow: cellShadow,
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.4rem",
                  color: "#666",
                  fontWeight: "bold",
                }}
              >
                {/* <div style={{ fontSize: "0.35rem", color: "#333", textShadow: "0 1px 1px rgba(255,255,255,0.8)" }}>
                  [{rowIndex},{colIndex}]
                </div> */}
                {cell.type === "center" && (
                  <span style={{ fontSize: "0.6rem" }}>★</span>
                )}
                {cell.type === "start" && (
                  <span style={{ fontSize: "0.5rem", color: "#000" }}>S</span>
                )}
                {/* {cell.pathIndex >= 0 && (
                  <span
                    style={{
                      fontSize: "0.5rem",
                      color: "#000",
                      fontWeight: "bold",
                    }}
                  >
                    {cell.pathIndex}
                  </span>
                )} */}
              </div>
            );
          })
        )}
      </>
    );
  };

  return (
    <motion.div
      style={{
        width: "100%",
        maxWidth: "650px",
        margin: "0 auto",
        aspectRatio: "1",
        position: "relative",
        background: "linear-gradient(145deg, #2d3748, #1a202c)",
        borderRadius: "20px",
        padding: "20px",
        boxShadow:
          "0 25px 70px rgba(0,0,0,0.8), inset 0 2px 10px rgba(255,255,255,0.1), inset 0 -2px 10px rgba(0,0,0,0.5)",
        border: "3px solid #374151",
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          background: "linear-gradient(145deg, #fafafa, #e5e5e5)",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow:
            "inset 0 4px 12px rgba(0,0,0,0.15), inset 0 -4px 12px rgba(255,255,255,0.8)",
        }}
      >
        {/* Render the board grid */}
        {renderBoard()}

        {/* Render home areas */}
        {renderHomeArea("red")}
        {renderHomeArea("green")}
        {renderHomeArea("yellow")}
        {renderHomeArea("blue")}

        {/* Render pawns on track */}
        {team.players.map((player) =>
          player.pawns.map((position, index) =>
            renderTrackPawn(player, index, position)
          )
        )}
      </div>
    </motion.div>
  );
};

export default LudoBoard;
