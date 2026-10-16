"use client";

import { useState } from "react";

interface AnnouncementProps {
  message: string;
  createdAt?: string;
}

export default function AnnouncementItem({ message, createdAt }: AnnouncementProps) {
  const [expanded, setExpanded] = useState(false);
  const words = message.split(" ");
  const isLong = words.length > 10;
  const shortText = isLong ? words.slice(0, 10).join(" ") + "..." : message;

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 transition-colors">
      <div className="text-sm text-slate-800">
        {isLong ? (
          <>
            <span>{expanded ? message : shortText}</span>
            <button
              onClick={() => setExpanded(!expanded)}
              className="ml-2 font-medium text-emerald-600 underline hover:text-emerald-700"
            >
              {expanded ? "Show Less" : "Show More"}
            </button>
          </>
        ) : (
          <span>{message}</span>
        )}
      </div>
      {createdAt && (
        <p className="mt-2 text-xs text-slate-500">📅 Posted on {createdAt}</p>
      )}
    </div>
  );
}
