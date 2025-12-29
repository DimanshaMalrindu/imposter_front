import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

// Sound wave component
const SoundWave = () => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "4px",
        height: "40px",
      }}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          style={{
            width: "4px",
            background: "linear-gradient(180deg, #10b981, #059669)",
            borderRadius: "2px",
          }}
          animate={{
            height: ["20px", "40px", "15px", "35px", "20px"],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

const VoiceChat = ({ socket, teamId, playerId, team, activeSpeakers }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const peerConnectionsRef = useRef(new Map());
  const audioRefs = useRef({});
  const localStreamRef = useRef(null);

  // Get current player's name
  const currentPlayer = team?.players.find((p) => p.id === playerId);
  const currentPlayerName = currentPlayer?.name || "Unknown";

  // Check if current player is speaking
  const isCurrentPlayerSpeaking = activeSpeakers?.includes(playerId) || false;

  // Get names of other speakers
  const otherSpeakers =
    team?.players
      .filter((p) => activeSpeakers?.includes(p.id) && p.id !== playerId)
      .map((p) => p.name) || [];
  const hasOtherSpeakers = otherSpeakers.length > 0;

  // Initialize microphone
  const initMicrophone = async () => {
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert(
          "Your browser doesn't support audio. Please use a modern browser."
        );
        return null;
      }

      // Request microphone with mobile-friendly settings
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      setLocalStream(stream);
      localStreamRef.current = stream;
      console.log("Microphone initialized successfully");
      return stream;
    } catch (error) {
      console.error("Error accessing microphone:", error);
      let errorMessage = "Could not access microphone. ";

      if (
        error.name === "NotAllowedError" ||
        error.name === "PermissionDeniedError"
      ) {
        errorMessage +=
          "Please allow microphone permissions in your browser settings.";
      } else if (
        error.name === "NotFoundError" ||
        error.name === "DevicesNotFoundError"
      ) {
        errorMessage += "No microphone found. Please connect a microphone.";
      } else if (
        error.name === "NotReadableError" ||
        error.name === "TrackStartError"
      ) {
        errorMessage += "Microphone is already in use by another application.";
      } else {
        errorMessage += "Error: " + error.message;
      }

      alert(errorMessage);
      return null;
    }
  };

  // Create peer connection for WebRTC
  const createPeerConnection = (targetSocketId, stream) => {
    const configuration = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    };

    const pc = new RTCPeerConnection(configuration);

    // Add local stream tracks to peer connection
    const audioStream = stream || localStreamRef.current;
    if (audioStream) {
      audioStream.getTracks().forEach((track) => {
        pc.addTrack(track, audioStream);
      });
    }

    // Handle incoming tracks
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      console.log("Received remote stream from:", targetSocketId);
      if (audioRefs.current[targetSocketId]) {
        const audioElement = audioRefs.current[targetSocketId];
        audioElement.srcObject = remoteStream;

        // Mobile Safari requires user interaction for audio playback
        // Try to play and handle potential autoplay restrictions
        audioElement.play().catch((e) => {
          console.warn(
            "Autoplay prevented, will retry on user interaction:",
            e
          );
          // Add a one-time click listener to the document to resume audio
          const resumeAudio = () => {
            audioElement
              .play()
              .then(() => {
                console.log("Audio playback resumed for:", targetSocketId);
                document.removeEventListener("click", resumeAudio);
                document.removeEventListener("touchstart", resumeAudio);
              })
              .catch((err) => console.error("Still cannot play:", err));
          };
          document.addEventListener("click", resumeAudio, { once: true });
          document.addEventListener("touchstart", resumeAudio, { once: true });
        });
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("voice-ice-candidate", {
          teamId,
          candidate: event.candidate,
          targetSocketId,
        });
      }
    };

    // Log connection state changes
    pc.onconnectionstatechange = () => {
      console.log(
        `Connection state with ${targetSocketId}:`,
        pc.connectionState
      );
    };

    return pc;
  };

  // Toggle microphone on/off
  const toggleMicrophone = async () => {
    // If currently speaking, turn off the mic
    if (isCurrentPlayerSpeaking) {
      setIsSpeaking(false);
      socket.emit("stop-speaking", { teamId, playerId });

      // Close all peer connections
      peerConnectionsRef.current.forEach((pc) => pc.close());
      peerConnectionsRef.current.clear();
    } else {
      // Turn on the mic
      const stream = localStreamRef.current || (await initMicrophone());
      if (!stream) return;

      setIsSpeaking(true);
      socket.emit("start-speaking", { teamId, playerId });

      // Create peer connections with all other players
      const otherPlayers = team.players.filter((p) => p.id !== playerId);
      for (const player of otherPlayers) {
        const pc = createPeerConnection(player.socketId, stream);
        peerConnectionsRef.current.set(player.socketId, pc);

        // Create and send offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("voice-offer", {
          teamId,
          offer,
          targetSocketId: player.socketId,
        });
      }
    }
  };

  // Handle WebRTC signaling
  useEffect(() => {
    if (!socket) return;

    const handleVoiceOffer = async ({ offer, senderSocketId }) => {
      // Make sure we have a local stream before responding
      const stream = localStreamRef.current || (await initMicrophone());
      if (!stream) {
        console.error("No local stream available to answer offer");
        return;
      }

      const pc = createPeerConnection(senderSocketId, stream);
      peerConnectionsRef.current.set(senderSocketId, pc);

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("voice-answer", {
        teamId,
        answer,
        targetSocketId: senderSocketId,
      });
    };

    const handleVoiceAnswer = async ({ answer, senderSocketId }) => {
      const pc = peerConnectionsRef.current.get(senderSocketId);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    };

    const handleIceCandidate = async ({ candidate, senderSocketId }) => {
      const pc = peerConnectionsRef.current.get(senderSocketId);
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    };

    socket.on("voice-offer", handleVoiceOffer);
    socket.on("voice-answer", handleVoiceAnswer);
    socket.on("voice-ice-candidate", handleIceCandidate);

    return () => {
      socket.off("voice-offer", handleVoiceOffer);
      socket.off("voice-answer", handleVoiceAnswer);
      socket.off("voice-ice-candidate", handleIceCandidate);
    };
  }, [socket, teamId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      peerConnectionsRef.current.forEach((pc) => pc.close());
      peerConnectionsRef.current.clear();
    };
  }, []);

  return (
    <motion.div
      style={{
        marginTop: "1.5rem",
        padding: "1.5rem",
        background: "rgba(99, 102, 241, 0.1)",
        borderRadius: "12px",
        border: "1px solid rgba(99, 102, 241, 0.3)",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div style={{ textAlign: "center" }}>
        <h3
          style={{
            marginBottom: "1rem",
            color: "var(--text-secondary)",
            fontSize: "1.1rem",
          }}
        >
          🎙️ Voice Chat
        </h3>

        <motion.button
          className="btn btn-primary"
          style={{
            width: "100%",
            padding: "1.5rem",
            fontSize: "1.2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            background: isCurrentPlayerSpeaking
              ? "linear-gradient(135deg, #ef4444, #dc2626)"
              : "linear-gradient(135deg, #6366f1, #4f46e5)",
            cursor: "pointer",
            userSelect: "none",
          }}
          onClick={toggleMicrophone}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={
            isCurrentPlayerSpeaking
              ? {
                  boxShadow: [
                    "0 10px 30px rgba(239, 68, 68, 0.3)",
                    "0 15px 40px rgba(239, 68, 68, 0.6)",
                    "0 10px 30px rgba(239, 68, 68, 0.3)",
                  ],
                }
              : {}
          }
          transition={{
            duration: 1,
            repeat: isCurrentPlayerSpeaking ? Infinity : 0,
          }}
        >
          <span style={{ fontSize: "2rem" }}>
            {isCurrentPlayerSpeaking ? "🔴" : "🎤"}
          </span>
          <span>{isCurrentPlayerSpeaking ? "Mic ON" : "Mic OFF"}</span>
        </motion.button>

        {hasOtherSpeakers && (
          <motion.div
            style={{
              marginTop: "1rem",
              padding: "1rem",
              background: "rgba(16, 185, 129, 0.1)",
              borderRadius: "8px",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.75rem",
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <SoundWave />
            <p
              style={{
                color: "var(--success-color)",
                fontSize: "0.9rem",
                margin: 0,
              }}
            >
              <strong>{otherSpeakers.join(", ")}</strong>{" "}
              {otherSpeakers.length === 1 ? "is" : "are"} speaking
            </p>
          </motion.div>
        )}

        <p
          style={{
            marginTop: "1rem",
            color: "var(--text-secondary)",
            fontSize: "0.85rem",
          }}
        >
          {isCurrentPlayerSpeaking
            ? "Click to turn off microphone"
            : "Click to turn on microphone"}
        </p>
      </div>

      {/* Hidden audio elements for remote streams */}
      {team?.players
        .filter((p) => p.id !== playerId)
        .map((player) => (
          <audio
            key={player.socketId}
            ref={(el) => {
              if (el) {
                audioRefs.current[player.socketId] = el;
                // Set volume to max for better mobile audio
                el.volume = 1.0;
              }
            }}
            autoPlay
            playsInline
            controls={false}
            style={{ display: "none" }}
          />
        ))}
    </motion.div>
  );
};

export default VoiceChat;
