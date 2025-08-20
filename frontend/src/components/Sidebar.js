import React from "react";
import { Link } from "react-router-dom";

const Sidebar = ({ role }) => {
  let menuItems = [];

  if (role === "admin") {
    menuItems = [
      { name: "Dashboard Home", path: "/admin" },
      { name: "Manage Users", path: "/admin/users" },
      { name: "Manage Agents", path: "/admin/agents" },
      { name: "Properties", path: "/admin/properties" },
      { name: "Transactions", path: "/admin/transactions" },
      { name: "Reports", path: "/admin/reports" },
      { name: "Settings", path: "/admin/settings" },
    ];
  } else if (role === "agent") {
    menuItems = [
      { name: "Dashboard Home", path: "/agent" },
      { name: "My Leads", path: "/agent/leads" },
      { name: "My Properties", path: "/agent/properties" },
      { name: "My Transactions", path: "/agent/transactions" },
      { name: "Profile", path: "/agent/profile" },
    ];
  } else if (role === "client") {
    menuItems = [
      { name: "Dashboard Home", path: "/properties" },
      { name: "My Properties", path: "/properties" },
      { name: "My Transactions", path: "/client/transactions" },
      { name: "Profile", path: "/client/profile" },
    ];
  }

  return (
    <div className="w-64 bg-gray-800 h-screen text-white p-5">
      <h2 className="text-xl font-bold mb-6 capitalize">{role} Dashboard</h2>
      <ul className="space-y-4">
        {menuItems.map((item, index) => (
          <li key={index}>
            <Link to={item.path} className="hover:text-yellow-400">
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
