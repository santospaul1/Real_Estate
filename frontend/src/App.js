import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PropertyList from "./components/PropertyList";
import PropertyForm from "./components/PropertyForm";
import Login from './pages/Login';
import AppInitializer from "./components/AppInitializer";
import LeadList from "./components/LeadList";
import LeadForm from "./pages/LeadForm";
import Dashboard from "./Admin/Dashboard";
import RegisterClient from "./pages/RegisterClient";
//import SalesReport from "./pages/SalesReport";
//import TransactionList from "./pages/TransactionList";
import AgentList from "./pages/AgentList";
import AgentDashboard from "./pages/AgentDashboard";
import CommunicationList from "./pages/CommunicationLogList";
//import ClientDetail from "./pages/ClientDetail";
import ClientList from "./pages/ClientList";
//import LeadDetail from "./pages/LeadDetail";
//import ProtectedRoute from "./components/ProtectedRoute";


export default function App() {
  return (
    <AppInitializer>
    <Router>
      <Routes>

  
 <Route path="/dashboard" element={<Dashboard />} />
  <Route
  path="/communicationlogs"
  element={
    
      <CommunicationList />
    
  }
/>
<Route path="/agents" element={<AgentList />} />
  <Route path="/leads" element={<LeadList />} />
  <Route path="/leads/add" element={<LeadForm />} />
  <Route path="/" element={<PropertyList />} />
  <Route path="/clients" element={<ClientList />}/>
  <Route path="/login" element={<Login />} />
  <Route path="/properties" element={<PropertyList />} />
  <Route path="/register" element={<RegisterClient/>} />
  <Route path="/properties/add" element={<PropertyForm isEdit={false} />} />
  <Route path="/properties/edit/:id" element={<PropertyForm isEdit={true} />} />
  <Route
  path="/agent/dashboard"
  element={
    
      <AgentDashboard />
    
  }
/>

</Routes>

    </Router>
    </AppInitializer>
  );
}
