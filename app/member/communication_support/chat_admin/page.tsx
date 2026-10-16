"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import SupportNavbar from "@/components/navigation/SupportNavbar";

import {
  MessageCircle,
  Send,
  UserRound,
} from "lucide-react";

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  sender_type: "member" | "admin";
  message: string;
  created_at: string;
}

export default function MemberChatPage() {
  const searchParams = useSearchParams();

  /*
  ============================================================
  ADMIN ID
  ============================================================

  admin_id=1 -> ADMIN
  admin_id=2 -> MD

  The numeric ID is still used internally by the API/database.
  Only the frontend display name changes.
  ============================================================
  */

  const adminId = Number(searchParams.get("admin_id")) || 1;

  /*
  ============================================================
  FRONTEND DISPLAY NAME
  ============================================================
  */

  const adminDisplayName =
    adminId === 2 ? "MD" : "ADMIN";

  /*
  ============================================================
  STATE
  ============================================================
  */

  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  const chatBoxRef = useRef<HTMLDivElement>(null);

  /*
  ============================================================
  FETCH MESSAGES
  ============================================================
  */

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/member/communication_support/chat?admin_id=${adminId}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load messages."
        );
      }

      setMessages(data.messages || []);
      setError("");
    } catch (err) {
      console.error(
        "Failed to fetch messages:",
        err
      );

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to load messages.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [adminId]);

  /*
  ============================================================
  INITIAL FETCH + POLLING
  ============================================================
  */

  useEffect(() => {
    setIsLoading(true);

    fetchMessages();

    const interval = setInterval(() => {
      fetchMessages();
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchMessages]);

  /*
  ============================================================
  AUTO SCROLL
  ============================================================
  */

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop =
        chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  /*
  ============================================================
  SEND MESSAGE
  ============================================================
  */

  const sendMessage = async () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || isSending) {
      return;
    }

    setIsSending(true);
    setError("");

    try {
      const response = await fetch(
        "/api/member/communication_support/chat_admin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            /*
            IMPORTANT:
            Keep the actual numeric admin ID.
            */

            admin_id: adminId,
            message: trimmedMessage,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to send message."
        );
      }

      setMessage("");

      await fetchMessages();
    } catch (err) {
      console.error(
        "Failed to send message:",
        err
      );

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to send message.");
      }
    } finally {
      setIsSending(false);
    }
  };

  /*
  ============================================================
  ENTER TO SEND
  SHIFT + ENTER = NEW LINE
  ============================================================
  */

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /*
  ============================================================
  FORMAT DATE
  ============================================================
  */

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString(
      "en-NG",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };

  /*
  ============================================================
  PAGE
  ============================================================
  */

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900">

      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <SupportNavbar />

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 -mt-24 sm:px-6 lg:px-8">

        <div className="space-y-5">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">

            <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative z-10">

              <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300">

                <MessageCircle className="h-4 w-4" />

                Member Support

              </div>

              <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">

                Chat with {adminDisplayName}

              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">

                Send a message to the cooperative
                administration team. Our administrators
                will respond to your enquiry as soon as
                possible.

              </p>

            </div>

          </div>

          {/* =================================================
              ADMIN SELECTION
          ================================================= */}

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

              <div>

                <h2 className="text-sm font-bold text-slate-900">
                  Select Administrator
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Choose an administrator to start or
                  continue your conversation.
                </p>

              </div>

              <div className="flex flex-wrap gap-2">

                {/* =================================================
                    ADMIN 1
                ================================================== */}

                <Link
                  href="/member/communication_support/chat_admin?admin_id=1"
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                    adminId === 1
                      ? "bg-slate-900 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >

                  <UserRound className="h-4 w-4" />

                  ADMIN

                </Link>

                {/* =================================================
                    MD
                ================================================== */}

                <Link
                  href="/member/communication_support/chat_md?admin_id=2"
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                    adminId === 2
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >

                  <UserRound className="h-4 w-4" />

                  MD

                </Link>

              </div>

            </div>

          </div>

          {/* =================================================
              CHAT CARD
          ================================================= */}

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md">

            {/* =================================================
                CHAT HEADER
            ================================================= */}

            <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">

                  <MessageCircle className="h-5 w-5" />

                </div>

                <div>

                  <h2 className="text-sm font-bold text-slate-900">

                    Conversation with{" "}
                    {adminDisplayName}

                  </h2>

                  <p className="text-xs text-slate-500">

                    Messages are updated automatically.

                  </p>

                </div>

                <div className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-emerald-600">

                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />

                  Online

                </div>

              </div>

            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="mx-5 mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">

                {error}

              </div>
            )}

            {/* =================================================
                CHAT BODY
            ================================================= */}

            <div
              ref={chatBoxRef}
              className="h-[55vh] min-h-[400px] max-h-[650px] space-y-4 overflow-y-auto bg-slate-50/70 p-4 sm:p-6"
            >

              {/* =================================================
                  LOADING
              ================================================= */}

              {isLoading ? (

                <div className="flex h-full items-center justify-center">

                  <div className="text-center">

                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />

                    <p className="mt-3 text-sm text-slate-500">

                      Loading conversation...

                    </p>

                  </div>

                </div>

              ) : messages.length === 0 ? (

                /* =================================================
                   EMPTY CHAT
                ================================================= */

                <div className="flex h-full items-center justify-center">

                  <div className="max-w-sm text-center">

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">

                      <MessageCircle className="h-7 w-7" />

                    </div>

                    <h3 className="mt-4 text-sm font-bold text-slate-900">

                      No messages yet

                    </h3>

                    <p className="mt-1 text-xs leading-relaxed text-slate-500">

                      Start the conversation by
                      sending a message to{" "}
                      {adminDisplayName}.

                    </p>

                  </div>

                </div>

              ) : (

                /* =================================================
                   MESSAGES
                ================================================= */

                messages.map((msg) => {

                  const isMember =
                    msg.sender_type === "member";

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${
                        isMember
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >

                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[70%] ${
                          isMember
                            ? "rounded-br-md bg-slate-900 text-white"
                            : "rounded-bl-md border border-slate-200 bg-white text-slate-900"
                        }`}
                      >

                        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">

                          {msg.message}

                        </p>

                        <div className="mt-2 text-[10px] text-slate-400">

                          {isMember
                            ? "You"
                            : adminDisplayName}

                          {" • "}

                          {formatDate(
                            msg.created_at
                          )}

                        </div>

                      </div>

                    </div>
                  );
                })

              )}

            </div>

            {/* =================================================
                MESSAGE FORM
            ================================================= */}

            <div className="border-t border-slate-200 bg-white p-4">

              <div className="flex items-end gap-3">

                <textarea
                  value={message}
                  onChange={(e) =>
                    setMessage(e.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  rows={2}
                  placeholder={`Type your message to ${adminDisplayName}...`}
                  disabled={isSending}
                  className="min-h-[52px] flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={
                    !message.trim() ||
                    isSending
                  }
                  className="inline-flex h-[52px] items-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  <Send className="h-4 w-4" />

                  <span className="hidden sm:inline">

                    {isSending
                      ? "Sending..."
                      : "Send"}

                  </span>

                </button>

              </div>

              <p className="mt-2 px-1 text-[10px] text-slate-400">

                Press Enter to send. Press
                Shift + Enter for a new line.

              </p>

            </div>

          </div>

        </div>

      </main>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="mt-auto border-t border-slate-200 bg-white py-6">

        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">

          <p className="text-xs text-slate-500">

            &copy; {new Date().getFullYear()}{" "}
            DCG Multipurpose Cooperative Society Ltd.
            All rights reserved.

          </p>

        </div>

      </footer>

    </div>
  );
}