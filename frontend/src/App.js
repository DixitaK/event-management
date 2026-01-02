import React, { useState, useEffect } from "react";
import EventsPage from "./pages/EventsPage";
import { getCategories, getEvents, deleteEvent } from "./api/events";
import "./App.css";

function App() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Event Management System</h1>
      <EventsPage />
    </div>
  );
}

export default App;
