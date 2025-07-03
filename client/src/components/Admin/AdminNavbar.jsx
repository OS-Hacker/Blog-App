import { FaPlus, FaList, FaEdit } from "react-icons/fa";
import styled from "styled-components";

const AdminNavbar = ({ activeTab, setActiveTab }) => {
  return (
    <Wrapper>
      <nav className="admin-navbar">
        <div className="nav-container">
          <button
            className={`nav-item ${activeTab === "create" ? "active" : ""}`}
            onClick={() => setActiveTab("create")}
          >
            <FaPlus className="nav-icon" />
          </button>

          <button
            className={`nav-item ${activeTab === "read" ? "active" : ""}`}
            onClick={() => setActiveTab("read")}
          >
            <FaList className="nav-icon" />
          </button>
        </div>
      </nav>
    </Wrapper>
  );
};

export default AdminNavbar;

const Wrapper = styled.section`
  .admin-navbar {
    color: white;
    width: 50vw;
    padding: 10px 0;
  }

  .nav-container {
    display: flex;
    justify-content: space-around;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .nav-item {
    background: none;
    border: none;
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px 15px;
    cursor: pointer;
    transition: all 0.3s;
    border-radius: 5px;
  }

  .nav-item:hover {
    background-color: #495057;
  }

  .nav-item.active {
    background-color: #007bff;
  }

  .nav-icon {
    font-size: 1.2rem;
    margin-bottom: 5px;
  }

  .nav-item span {
    font-size: 0.9rem;
  }

  @media (max-width: 600px) {
    .nav-container {
      flex-direction: column;
      align-items: center;
    }

    .nav-item {
      width: 100%;
      flex-direction: row;
      justify-content: center;
      margin: 5px 0;
    }

    .nav-icon {
      margin-bottom: 0;
      margin-right: 10px;
      font-size: 1rem;
    }
  }
`;
