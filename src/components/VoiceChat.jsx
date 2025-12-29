import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const VoiceChat = ({
  socket,
  teamId,
  playerId,
  team,
  activeSpeakers,
  eventPrefix = "",
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const peerConnectionsRef = useRef(new Map());
  const audioRefs = useRef({});
  const localStreamRef = useRef(null);

  // Check if current player is speaking
  const isCurrentPlayerSpeaking = activeSpeakers?.includes(playerId) || false;

  // Helper to get event name with optional prefix
  const getEventName = (eventName) => {
    return eventPrefix ? `${eventPrefix}-${eventName}` : eventName;
  };

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
        socket.emit(getEventName("voice-ice-candidate"), {
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
    // If currently speaking, turn off the mic (mute)
    if (isCurrentPlayerSpeaking) {
      setIsSpeaking(false);
      socket.emit(getEventName("stop-speaking"), { teamId, playerId });

      // Disable the audio track (mute) instead of closing connections
      // This allows the player to continue hearing others
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach((track) => {
          track.enabled = false;
        });
      }
    } else {
      // Turn on the mic (unmute)
      const stream = localStreamRef.current || (await initMicrophone());
      if (!stream) return;

      // Enable the audio track (unmute)
      stream.getAudioTracks().forEach((track) => {
        track.enabled = true;
      });

      setIsSpeaking(true);
      socket.emit(getEventName("start-speaking"), { teamId, playerId });

      // Only create new peer connections if they don't exist yet
      const otherPlayers = team.players.filter((p) => p.id !== playerId);
      for (const player of otherPlayers) {
        // Check if peer connection already exists
        if (!peerConnectionsRef.current.has(player.socketId)) {
          const pc = createPeerConnection(player.socketId, stream);
          peerConnectionsRef.current.set(player.socketId, pc);

          // Create and send offer
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit(getEventName("voice-offer"), {
            teamId,
            offer,
            targetSocketId: player.socketId,
          });
        }
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

      // Mute the track initially (user needs to unmute to speak)
      stream.getAudioTracks().forEach((track) => {
        track.enabled = false;
      });

      const pc = createPeerConnection(senderSocketId, stream);
      peerConnectionsRef.current.set(senderSocketId, pc);

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit(getEventName("voice-answer"), {
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

    socket.on(getEventName("voice-offer"), handleVoiceOffer);
    socket.on(getEventName("voice-answer"), handleVoiceAnswer);
    socket.on(getEventName("voice-ice-candidate"), handleIceCandidate);

    return () => {
      socket.off(getEventName("voice-offer"), handleVoiceOffer);
      socket.off(getEventName("voice-answer"), handleVoiceAnswer);
      socket.off(getEventName("voice-ice-candidate"), handleIceCandidate);
    };
  }, [socket, teamId, eventPrefix]);

  // Initialize microphone on mount (muted by default)
  useEffect(() => {
    const init = async () => {
      const stream = await initMicrophone();
      if (stream) {
        // Start with microphone muted
        stream.getAudioTracks().forEach((track) => {
          track.enabled = false;
        });
      }
    };
    init();
  }, []);

  // Handle page visibility changes (for mobile - release mic when app is backgrounded)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden (app went to background)
        console.log("Page hidden - releasing microphone");
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((track) => track.stop());
          localStreamRef.current = null;
          setLocalStream(null);
        }
        // Close peer connections to clean up resources
        peerConnectionsRef.current.forEach((pc) => pc.close());
        peerConnectionsRef.current.clear();
      } else {
        // Page is visible again (app came to foreground)
        console.log("Page visible - reinitializing microphone");
        const reinit = async () => {
          const stream = await initMicrophone();
          if (stream) {
            // Keep microphone muted by default
            stream.getAudioTracks().forEach((track) => {
              track.enabled = false;
            });
          }
        };
        reinit();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

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
    <>
      {/* Floating mic button at bottom left */}
      <motion.div
        style={{
          position: "fixed",
          bottom: "2rem",
          left: "2rem",
          zIndex: 1000,
        }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
      >
        <motion.button
          onClick={toggleMicrophone}
          style={{
            width: "70px",
            height: "70px",
            borderRadius: "50%",
            border: "none",
            background: isCurrentPlayerSpeaking
              ? "linear-gradient(135deg, #10b981, #059669)"
              : "linear-gradient(135deg, #ef4444, #dc2626)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2rem",
            boxShadow: isCurrentPlayerSpeaking
              ? "0 8px 32px rgba(16, 185, 129, 0.5)"
              : "0 8px 32px rgba(239, 68, 68, 0.5)",
            position: "relative",
            overflow: "visible",
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={
            isCurrentPlayerSpeaking
              ? {
                  boxShadow: [
                    "0 8px 32px rgba(16, 185, 129, 0.5)",
                    "0 12px 40px rgba(16, 185, 129, 0.7)",
                    "0 8px 32px rgba(16, 185, 129, 0.5)",
                  ],
                }
              : {}
          }
          transition={{
            duration: 1.5,
            repeat: isCurrentPlayerSpeaking ? Infinity : 0,
          }}
        >
          <span
            style={{
              position: "relative",
              filter: isCurrentPlayerSpeaking ? "none" : "brightness(0.8)",
            }}
          >
            🎤
            {!isCurrentPlayerSpeaking && (
              <span
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%) rotate(45deg)",
                  width: "120%",
                  height: "3px",
                  background: "#fff",
                  borderRadius: "2px",
                }}
              />
            )}
          </span>
        </motion.button>
      </motion.div>

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
    </>
  );
};

export default VoiceChat;
