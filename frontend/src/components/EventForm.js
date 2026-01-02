import React, { useState, useEffect } from "react";
import Select from "react-select";
import { createEvent, updateEvent } from "../api/events";

export default function EventForm({ categories, editEvent, onSaved }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    if (editEvent) {
      setName(editEvent.name);
      setDescription(editEvent.description);
      setStart(editEvent.start_date_time);
      setEnd(editEvent.end_date_time);
      setSelectedCategories(editEvent.categories.map(c => ({ label: c, value: c })));
    }
  }, [editEvent]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const category_ids = selectedCategories.map(c => c.value);
    try {
      if (editEvent) {
        await updateEvent(editEvent.id, { name, description, start_date_time: start, end_date_time: end, category_ids });
      } else {
        await createEvent({ name, description, start_date_time: start, end_date_time: end, category_ids });
      }
      onSaved();
      setName(""); setDescription(""); setStart(""); setEnd(""); setSelectedCategories([]);
    } catch (err) {
      alert(err.response?.data?.message || "Error saving event");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{editEvent ? "Edit Event" : "Create Event"}</h2>
      <div>
        <label>Name:</label>
        <input value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div>
        <label>Description:</label>
        <input value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      <div>
        <label>Start Date & Time:</label>
        <input type="datetime-local" value={start} onChange={e => setStart(e.target.value)} required />
      </div>
      <div>
        <label>End Date & Time:</label>
        <input type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} required />
      </div>
      <div>
        <label>Categories:</label>
        <Select
          isMulti
          options={categories.map(c => ({ label: c.name, value: c.id }))}
          value={selectedCategories}
          onChange={setSelectedCategories}
        />
      </div>
      <button type="submit">{editEvent ? "Update" : "Create"}</button>
    </form>
  );
}
