import React from "react";
import styled from "styled-components";

const Profile = () => {
  return (
    <Wrapper>
      <div className="flex items-center justify-center">
        <div className="text-center p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Profile Page
          </h1>
          <div className="flex justify-center">
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 w-full">
              <p className="font-medium">Work in progress</p>
              <p className="text-sm mt-1">
                This page is currently under development
              </p>
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default Profile;

const Wrapper = styled.section`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 90vh;
  position: relative;
  top: 65px;
  background-color: black;
`;
