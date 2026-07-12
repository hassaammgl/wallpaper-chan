"use client";

import { useState, useEffect } from "react";
import apiRequest from "@/lib/apiRequest";
import { HiCloud, HiPhoto } from "react-icons/hi2";

function SettingsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await apiRequest.get("/api/admin/settings");
        setData(res.data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleUpdate = async (uploadProvider) => {
    setUpdating(true);
    try {
      await apiRequest.patch("/api/admin/settings", { uploadProvider });
      setData((prev) => ({ ...prev, uploadProvider }));
    } catch {
      // ignore
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-accent" />
      </div>
    );
  }

  if (error) return <p className="text-danger">Error: {error}</p>;

  const providers = [
    {
      id: "imagekit",
      name: "ImageKit",
      desc: "Fast CDN with URL-based transforms.",
      icon: HiPhoto,
    },
    {
      id: "cloudinary",
      name: "Cloudinary",
      desc: "Cloud media platform.",
      icon: HiCloud,
    },
  ];

  return (
    <div className="animate-fade-up mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-fog">Upload Settings</h1>
        <p className="mt-1 text-sm text-muted">
          Choose which CDN handles new wallpaper uploads site-wide
        </p>
      </div>

      <div className="space-y-4">
        {providers.map(({ id, name, desc, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleUpdate(id)}
            disabled={updating}
            className={`w-full rounded-[20px] border p-5 text-left transition-all ${
              data.uploadProvider === id
                ? "border-accent bg-accent-soft glow-ring"
                : "border-line glass hover:border-accent/30"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                  data.uploadProvider === id
                    ? "bg-accent text-ink"
                    : "bg-panel text-muted"
                }`}
              >
                <Icon size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-fog">{name}</h3>
                  {data.uploadProvider === id && (
                    <span className="rounded-full bg-parrot px-2 py-0.5 text-[10px] font-bold uppercase text-ink">
                      Active
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted">{desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default SettingsPage;
