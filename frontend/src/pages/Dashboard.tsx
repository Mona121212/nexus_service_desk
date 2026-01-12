import React from "react";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import "./Dashboard.css";

export const Dashboard: React.FC = () => {
  return (
    <div className="dashboard">
      <Header />
      <div className="dashboard-content">
        <Sidebar />
        <main className="dashboard-main">
          <div className="welcome-section">
            {" "}
            Dashboard
            <h2 className="welcome-title">Welcome to Nexus Service Desk</h2>
            <p className="welcome-text">
              This is a service desk management system, you can start using the
              various functions through the left menu.
            </p>
            <p className="welcome-hint">
              Tip: Click the left menu to start using
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};
