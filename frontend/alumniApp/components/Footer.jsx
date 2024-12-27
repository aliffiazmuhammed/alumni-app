import React from "react";

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <p style={styles.text}>
        Powered by <span style={styles.brand}>YLogX</span>
      </p>
    </footer>
  );
};

const styles = {
  footer: {
    padding: "10px 0",
    textAlign: "center",
    position: "relative",
    bottom: 0,
    width: "100%",
  },
  text: {
    margin: 0,
    fontSize: "14px",
    color: "#6c757d", // Muted text color
  },
  brand: {
    fontWeight: "bold",
    color: "#007bff", // Brand color (blue)
  },
};

export default Footer;
