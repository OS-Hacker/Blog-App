import React from "react";
import { RotatingLines } from "react-loader-spinner";

const Loading = () => {
  return (
    <div className="flex justify-center items-center bg-black text-#ff9800 max-h-screen fixed top-0 left-0 z-9999">
      <RotatingLines
        visible={true}
        height="50"
        strokeColor="#ff9800"
        width="50"
        strokeWidth="5"
        animationDuration="0.75"
        ariaLabel="rotating-lines-loading"
      />
    </div>
  );
};

export default Loading;
