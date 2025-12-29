import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const ErrorPopup = ({ message, onClose }) => {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          className="error-popup-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="error-popup"
            initial={{ scale: 0.8, opacity: 0, y: -50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="error-popup-icon">⚠️</div>
            <h3 className="error-popup-title">Error</h3>
            <p className="error-popup-message">{message}</p>
            <button className="error-popup-button" onClick={onClose}>
              OK
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ErrorPopup;
