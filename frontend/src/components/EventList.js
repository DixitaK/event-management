import React, { useEffect, useState } from "react";
import { getEvents, deleteEvent } from "../api/events";
import Select from "react-select";

export default function EventList({ categories, onEdit }) {
  const [events, setEvents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const fetchEvents = async () => {
    try {
      const params = {};
      if (selectedCategory) params.category_id = selectedCategory.value;
      const res = await getEvents(params);
      setEvents(res.data.events);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedCategory]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await deleteEvent(id);
        fetchEvents();
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
          {events.map(event => (
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
