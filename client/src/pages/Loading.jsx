import React from "react";
import { RotatingLines } from "react-loader-spinner";

const Loading = () => {
  return (
    <div
      style={{
        display: "flex",
        color: "#ff9800",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh", // Takes full viewport height
        width: "100%", // Takes full width
        position: "fixed", // Fixed position to stay centered during loading
        top: 0,
        left: 0,
        zIndex: 9999, // Ensures it appears above other content
      }}
    >
      <RotatingLines
        visible={true}
        height="60"
        strokeColor="#ff9800"
        width="60"
        strokeWidth="5"
        animationDuration="0.75"
        ariaLabel="rotating-lines-loading"
      />
    </div>
  );
};

export default Loading;
