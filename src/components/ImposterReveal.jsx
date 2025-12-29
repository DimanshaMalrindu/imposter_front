import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ImposterReveal = ({ isImposter }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="full-screen-overlay red-flash"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          background: isImposter
            ? "linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95))"
            : "rgba(30, 27, 75, 0.95)",
        }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            duration: 0.8,
          }}
          style={{ textAlign: "center" }}
        >
          <motion.div
            style={{ fontSize: "8rem", marginBottom: "1rem" }}
            animate={{
              rotate: [0, -10, 10, -10, 0],
              scale: [1, 1.1, 1, 1.1, 1],
            }}
            transition={{ duration: 0.5, repeat: 9 }}
          >
            {isImposter ? "🕵️" : "👀"}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {isImposter ? "YOU ARE THE IMPOSTER!" : "WATCH THE IMPOSTER!"}
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImposterReveal;
