import React, { useEffect, useState } from "react";
import EventList from "../components/EventList";
import EventForm from "../components/EventForm";
import { getCategories } from "../api/events";

export default function EventsPage() {
  const [categories, setCategories] = useState([]);
  const [editEvent, setEditEvent] = useState(null);

  const fetchCategories = async () => {
    const res = await getCategories();
    setCategories(res.data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div>
      <EventForm categories={categories} editEvent={editEvent} onSaved={() => setEditEvent(null)} />
      <EventList categories={categories} onEdit={setEditEvent} />
    </div>
  );
}
