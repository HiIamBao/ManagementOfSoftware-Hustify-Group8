"use client";

import { useState } from "react";

export default function AddJobForm() {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState<string[]>([""]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        company,
        location,
        logoUrl: logoUrl || undefined, // Only send if provided
        description,
        requirements: requirements.filter((r) => r.trim() !== ""),
        createdAt: new Date().toISOString(),
      }),
    });

    if (res.ok) {
      setSuccess(true);
      setTitle("");
      setCompany("");
      setLocation("");
      setLogoUrl("");
      setDescription("");
      setRequirements([""]);
    } else {
      setError("Failed to add job.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 border rounded mb-8 bg-white shadow-sm"
    >
      <h2 className="text-xl font-bold text-black">Add a New Job</h2>
      {success && <div className="text-green-600">Job added!</div>}
      {error && <div className="text-[#BF3131]">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold text-black">Job Title</label>
          <input
            className="border px-2 py-1 w-full rounded text-black"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Frontend Developer"
            required
          />
        </div>

        <div>
          <label className="block font-semibold text-black">Company</label>
          <input
            className="border px-2 py-1 w-full rounded text-black"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Microsoft"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold text-black">Location</label>
          <input
            className="border px-2 py-1 w-full rounded text-black"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Remote or New York, NY"
            required
          />
        </div>

        <div>
          <label className="block font-semibold text-black">
            Company Logo URL (optional)
          </label>
          <input
            className="border px-2 py-1 w-full rounded text-black"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://example.com/logo.png"
          />
        </div>
      </div>

      <div>
        <label className="block font-semibold text-black">
          Job Description
        </label>
        <textarea
          className="border px-2 py-1 w-full rounded min-h-[100px] text-black"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the job role and responsibilities"
          required
        />
      </div>

      <div>
        <label className="block font-semibold mb-1 text-black">
          Requirements
        </label>
        {requirements.map((req, idx) => (
          <div key={idx} className="flex gap-2 mb-2">
            <input
              className="border px-2 py-1 flex-1 rounded text-black"
              value={req}
              onChange={(e) => {
                const newReqs = [...requirements];
                newReqs[idx] = e.target.value;
                setRequirements(newReqs);
              }}
              placeholder={`Requirement ${idx + 1}`}
              required={idx === 0}
            />
            <button
              type="button"
              onClick={() =>
                setRequirements(requirements.filter((_, i) => i !== idx))
              }
              className="text-red-500 px-2"
              disabled={requirements.length === 1}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setRequirements([...requirements, ""])}
          className="text-blue-600 mt-1 flex items-center gap-1"
        >
          <span className="text-lg">+</span> Add Requirement
        </button>
      </div>

      <button
        type="submit"
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
      >
        Add Job
      </button>
    </form>
  );
}
