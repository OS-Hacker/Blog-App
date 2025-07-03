import styled from "styled-components";
import SideBar from "./SideBar";
import { Outlet } from "react-router-dom";

const LayoutContainer = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
`;

const MainContent = styled.main`
  flex: 1;
  overflow: auto;
`;

const Layout = () => {
  return (
    <LayoutContainer>
      <SideBar />
      <MainContent>
        <Outlet />
      </MainContent>
    </LayoutContainer>
  );
};

export default Layout;
