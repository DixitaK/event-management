import React, { useState } from "react";
import Select from "react-select";
import { deleteEvent } from "../api/events";

export default function EventList({
  categories,
  onEdit,
  events,
  refreshEvents
}) {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const filteredEvents = selectedCategory
    ? events.filter(event =>
      event.categories.includes(selectedCategory.label)
    )
    : events;

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await deleteEvent(id);
        refreshEvents();
      } catch (err) {
        alert(err.response?.data?.message || "Error deleting event");
      }
    }
  };

  return (
    <div>
      <h2>Events</h2>
      <div className="select-container">
        <Select
          options={categories.map(c => ({ label: c.name, value: c.id }))}
          onChange={setSelectedCategory}
          isClearable
          placeholder="Filter by category"
        />
      </div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Start</th>
            <th>End</th>
            <th>Categories</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredEvents.map(event => (
            <tr key={event.id}>
              <td>{event.name}</td>
              <td>{event.description}</td>
              <td>{new Date(event.start_date_time).toLocaleString()}</td>
              <td>{new Date(event.end_date_time).toLocaleString()}</td>
              <td>{event.categories.join(", ")}</td>
              <td>
                <button onClick={() => onEdit(event)}>Edit</button>
                <button onClick={() => handleDelete(event.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
