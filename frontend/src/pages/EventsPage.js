import React, { useEffect, useState } from "react";
import EventList from "../components/EventList";
import EventForm from "../components/EventForm";
import { getCategories, getEvents } from "../api/events";

export default function EventsPage() {
  const [categories, setCategories] = useState([]);
  const [editEvent, setEditEvent] = useState(null);
  const [events, setEvents] = useState([]);

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await getEvents();
      setEvents(res.data.events);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchEvents();
  }, []);

  const handleSaved = async () => {
    setEditEvent(null);     // reset edit mode
    await fetchEvents();    // ALWAYS refresh list
  };

  const handleAddNew = () => {
    setEditEvent(null);     // only reset form, no fetch needed
  };

  return (
    <>
      <EventForm
        categories={categories}
        editEvent={editEvent}
        onSaved={handleSaved}
        onAddNew={handleAddNew}
      />

      <EventList
        categories={categories}
        onEdit={setEditEvent}
        events={events}
        refreshEvents={fetchEvents}
      />
    </>
  );
}
