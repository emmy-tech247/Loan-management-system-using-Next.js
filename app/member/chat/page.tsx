"use client";

import {
  useEffect,
  useState,
} from "react";

import ChatWindow from "@/components/chat/ChatWindow";

interface MemberSession {
  member_id: number;
  full_name: string;
}

export default function MemberChatPage() {
  const [
    member,
    setMember,
  ] = useState<MemberSession | null>(
    null
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  useEffect(() => {
    async function loadSession() {
      try {
        /*
         * Replace this endpoint with your
         * existing member session endpoint
         * if the project uses another route.
         */
        const response =
          await fetch(
            "/api/member/session",
            {
              credentials:
                "include",
              cache: "no-store",
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success ||
          !data.data
        ) {
          throw new Error(
            data.message ||
              "Member session not found."
          );
        }

        setMember(
          data.data
        );
      } catch (err) {
        console.error(
          "Member session error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load member session."
        );
      } finally {
        setLoading(false);
      }
    }

    loadSession();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-slate-400">
        Loading chat...
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="rounded-xl border border-rose-900 bg-rose-950/40 p-5 text-sm text-rose-300">
          {error ||
            "Member session not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4">
      <div className="mx-auto h-[calc(100vh-2rem)] max-w-5xl">
        <ChatWindow
          currentUserId={
            member.member_id
          }
          currentUserType="member"
          currentUserName={
            member.full_name
          }
          receiverId={2}
          receiverType="admin2"
          receiverName="Managing Director"
        />
      </div>
    </div>
  );
}