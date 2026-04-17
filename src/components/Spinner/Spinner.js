import React from "react";
import "./Spinner.css";

/**
 * Spinner
 * Pure CSS loading indicator.
 * @prop {string} size - "small" | "medium" (default) | "large"
 */
function Spinner({ size = "medium" }) {
  return (
    <div className={`spinner spinner--${size}`} role="status" aria-label="Loading…">
      <div className="spinner__ring" />
    </div>
  );
}

export default Spinner;
