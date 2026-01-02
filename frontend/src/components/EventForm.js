import React, { useState, useEffect } from "react";
import Select from "react-select";
import { createEvent, updateEvent } from "../api/events";

export default function EventForm({ categories, editEvent, onSaved, onAddNew }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);

  const formatDateTimeLocal = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (editEvent) {
      setName(editEvent.name);
      setDescription(editEvent.description || "");

      setStart(formatDateTimeLocal(editEvent.start_date_time));
      setEnd(formatDateTimeLocal(editEvent.end_date_time));

      // map event.categories (names) to actual IDs from categories prop
      const preSelected = editEvent.categories
        .map(catName => {
          const categoryObj = categories.find(c => c.name === catName);
          return categoryObj ? { label: categoryObj.name, value: categoryObj.id } : null;
        })
        .filter(Boolean);
      setSelectedCategories(preSelected);
    } else {
      // reset form
      setName("");
      setDescription("");
      setStart("");
      setEnd("");
      setSelectedCategories([]);
    }
  }, [editEvent, categories]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare category_ids array for backend
    const category_ids = selectedCategories.map(c => c.value);

    const payload = {
      name,
      description,
      start_date_time: start,
      end_date_time: end,
      category_ids
    };

    try {
      if (editEvent) {
        await updateEvent(editEvent.id, payload);
      } else {
        await createEvent(payload);
      }
      onSaved(); // refresh list and reset form
    } catch (err) {
      alert(err.response?.data?.message || "Error saving event");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{editEvent ? "Edit Event" : "Create Event"}</h2>

      {/* Existing inputs here */}
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
      {editEvent && (
        <button
          type="button"
          onClick={onAddNew} style={{ marginLeft: "10px" }}>
          Add
        </button>
      )}
    </form>
  );
}
