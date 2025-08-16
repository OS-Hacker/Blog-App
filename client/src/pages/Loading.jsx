import React from "react";
import { RotatingLines } from "react-loader-spinner";

const Loading = () => {
  return (
    <div className="flex justify-center items-center w-screen h-screen bg-black fixed top-0 left-0 z-[9999]">
      <RotatingLines
        visible={true}
        height="50"
        width="50"
        strokeColor="#ff9800"
        strokeWidth="5"
        animationDuration="0.75"
        ariaLabel="rotating-lines-loading"
      />
    </div>
  );
};

export default Loading;
