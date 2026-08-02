"use client";

import { useState, useEffect } from "react";
import apiRequest from "@/lib/apiRequest";
import DashboardStats from "@/components/admin/DashboardStats";

function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiRequest.get("/api/admin/stats");
        setData(res.data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-accent" />
      </div>
    );
  }

  if (error) return <p className="text-danger">Failed to load: {error}</p>;

  const { totals, recentUsers, recentPins } = data;

  return (
    <DashboardStats
      totals={totals}
      recentUsers={recentUsers}
      recentPins={recentPins}
    />
  );
}

export default DashboardPage;
