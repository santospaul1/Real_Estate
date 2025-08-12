import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PropertyList from "./components/PropertyList";
import PropertyForm from "./components/PropertyForm";

export default function App() {
  return (
    <Router>
      <Routes>
  <Route path="/" element={<PropertyList />} />
  <Route path="/properties" element={<PropertyList />} />
  <Route path="/properties/add" element={<PropertyForm isEdit={false} />} />
  <Route path="/properties/edit/:id" element={<PropertyForm isEdit={true} />} />
</Routes>

    </Router>
  );
}
