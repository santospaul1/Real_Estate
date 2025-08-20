import React from "react";

const Topbar = ({ username }) => {
  return (
    <div className="bg-gray-900 text-white px-6 py-3 flex justify-between items-center">
      <h1 className="text-lg font-bold">Real Estate Dashboard</h1>
      <span>Welcome, {username}</span>
    </div>
  );
};

export default Topbar;
