import React from "react";
import { Layout } from "../components/Layout";
import "./Dashboard.css";

export const Dashboard: React.FC = () => {
  return (
    <Layout>
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
    </Layout>
  );
};
