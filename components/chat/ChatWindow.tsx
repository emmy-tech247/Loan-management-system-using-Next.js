"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Send,
  Bold,
  Italic,
  Code,
  List,
  Terminal,
  Eye,
  Edit3,
  Loader2,
  CheckCheck,
  MessageSquare,
  RefreshCw,
} from "lucide-react";

import type {
  ChatMessage,
  ChatUserType,
} from "@/types/chat";

interface ChatWindowProps {
  currentUserId: number;
  currentUserType: ChatUserType;
  currentUserName: string;

  receiverId: number;
  receiverType: ChatUserType;
  receiverName: string;

  pollInterval?: number;
}

function escapeHtml(
  text: string
) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function parseMarkdown(
  text: string
) {
  if (!text) {
    return "";
  }

  let html =
    escapeHtml(text);

  /*
   * Code blocks
   */
  html = html.replace(
    /```([\s\S]*?)```/g,
    `<pre class="my-2 overflow-x-auto rounded-lg bg-slate-950 border border-slate-700 p-3 text-xs text-emerald-400"><code>$1</code></pre>`
  );

  /*
   * Inline code
   */
  html = html.replace(
    /`([^`]+)`/g,
    `<code class="rounded bg-slate-800 px-1.5 py-0.5 text-pink-300">$1</code>`
  );

  /*
   * Bold
   */
  html = html.replace(
    /\*\*(.*?)\*\*/g,
    "<strong>$1</strong>"
  );

  /*
   * Italic
   */
  html = html.replace(
    /(?<!\*)\*(.*?)\*(?!\*)/g,
    "<em>$1</em>"
  );

  /*
   * Links
   */
  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    `<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 underline">$1</a>`
  );

  /*
   * New lines
   */
  html = html.replace(
    /\n/g,
    "<br />"
  );

  return html;
}

function formatTime(
  value: string | Date
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return date.toLocaleTimeString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

export default function ChatWindow({
  currentUserId,
  currentUserType,
  currentUserName,
  receiverId,
  receiverType,
  receiverName,
  pollInterval = 5000,
}: ChatWindowProps) {
  const [
    messages,
    setMessages,
  ] = useState<ChatMessage[]>(
    []
  );

  const [
    messageText,
    setMessageText,
  ] = useState("");

  const [
    inputMode,
    setInputMode,
  ] = useState<
    "write" | "preview"
  >("write");

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isSending,
    setIsSending,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  const messagesEndRef =
    useRef<HTMLDivElement | null>(
      null
    );

  /*
   * ============================================================
   * LOAD CHAT
   * ============================================================
   */
  const loadMessages =
    useCallback(
      async (
        showLoader = false
      ) => {
        if (showLoader) {
          setIsLoading(true);
        }

        try {
          const params =
            new URLSearchParams({
              user1:
                String(
                  currentUserId
                ),
              user1Type:
                currentUserType,

              user2:
                String(
                  receiverId
                ),
              user2Type:
                receiverType,
            });

          const response =
            await fetch(
              `/api/message?${params.toString()}`,
              {
                method: "GET",
                credentials:
                  "include",
                cache: "no-store",
                headers: {
                  Accept:
                    "application/json",
                },
              }
            );

          const contentType =
            response.headers.get(
              "content-type"
            ) || "";

          if (
            !contentType.includes(
              "application/json"
            )
          ) {
            const text =
              await response.text();

            console.error(
              "Chat API returned non-JSON:",
              text.slice(
                0,
                500
              )
            );

            throw new Error(
              `Server returned an unexpected response (${response.status}).`
            );
          }

          const data =
            await response.json();

          if (
            !response.ok ||
            !data.success
          ) {
            throw new Error(
              data.message ||
                data.error ||
                "Unable to load messages."
            );
          }

          setMessages(
            Array.isArray(
              data.data
            )
              ? data.data
              : []
          );

          setError(null);
        } catch (err) {
          console.error(
            "Failed to load chat:",
            err
          );

          setError(
            err instanceof Error
              ? err.message
              : "Unable to load chat."
          );
        } finally {
          if (showLoader) {
            setIsLoading(false);
          }
        }
      },
      [
        currentUserId,
        currentUserType,
        receiverId,
        receiverType,
      ]
    );

  /*
   * ============================================================
   * INITIAL LOAD + POLLING
   * ============================================================
   */
  useEffect(() => {
    loadMessages(true);

    const interval =
      window.setInterval(
        () => {
          loadMessages(false);
        },
        pollInterval
      );

    return () =>
      window.clearInterval(
        interval
      );
  }, [
    loadMessages,
    pollInterval,
  ]);

  /*
   * ============================================================
   * SCROLL
   * ============================================================
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView(
      {
        behavior: "smooth",
      }
    );
  }, [messages]);

  /*
   * ============================================================
   * MARK RECEIVED MESSAGES READ
   * ============================================================
   */
  useEffect(() => {
    const unread =
      messages.some(
        (message) =>
          message.sender_id ===
            receiverId &&
          message.sender_type ===
            receiverType &&
          message.receiver_id ===
            currentUserId &&
          message.receiver_type ===
            currentUserType &&
          Number(
            message.is_read
          ) === 0
      );

    if (!unread) {
      return;
    }

    fetch(
      "/api/message/read",
      {
        method: "POST",
        credentials:
          "include",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          receiver_id:
            currentUserId,

          receiver_type:
            currentUserType,

          sender_id:
            receiverId,

          sender_type:
            receiverType,
        }),
      }
    )
      .then(() => {
        setMessages(
          (previous) =>
            previous.map(
              (message) => {
                if (
                  message.sender_id ===
                    receiverId &&
                  message.sender_type ===
                    receiverType &&
                  message.receiver_id ===
                    currentUserId &&
                  message.receiver_type ===
                    currentUserType
                ) {
                  return {
                    ...message,
                    is_read: 1,
                  };
                }

                return message;
              }
            )
        );
      })
      .catch((err) => {
        console.error(
          "Failed to mark chat as read:",
          err
        );
      });
  }, [
    messages,
    currentUserId,
    currentUserType,
    receiverId,
    receiverType,
  ]);

  /*
   * ============================================================
   * SEND MESSAGE
   * ============================================================
   */
  const handleSendMessage =
    async (
      event: FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      const message =
        messageText.trim();

      if (
        !message ||
        isSending
      ) {
        return;
      }

      setIsSending(true);
      setError(null);

      try {
        const response =
          await fetch(
            "/api/message",
            {
              method: "POST",
              credentials:
                "include",
              headers: {
                "Content-Type":
                  "application/json",
                Accept:
                  "application/json",
              },
              body: JSON.stringify({
                sender_id:
                  currentUserId,

                receiver_id:
                  receiverId,

                sender_type:
                  currentUserType,

                receiver_type:
                  receiverType,

                message,
              }),
            }
          );

        const contentType =
          response.headers.get(
            "content-type"
          ) || "";

        if (
          !contentType.includes(
            "application/json"
          )
        ) {
          const text =
            await response.text();

          console.error(
            "Send message returned non-JSON:",
            text.slice(
              0,
              500
            )
          );

          throw new Error(
            `Server returned an unexpected response (${response.status}).`
          );
        }

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              result.error ||
              "Unable to send message."
          );
        }

        /*
         * Immediately add the actual
         * database row to the UI.
         */
        if (result.data) {
          setMessages(
            (previous) => [
              ...previous,
              result.data,
            ]
          );
        } else {
          await loadMessages(
            false
          );
        }

        setMessageText("");
        setInputMode("write");
      } catch (err) {
        console.error(
          "Failed to send message:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to send message."
        );
      } finally {
        setIsSending(false);
      }
    };

  /*
   * ============================================================
   * MARKDOWN BUTTONS
   * ============================================================
   */
  const insertMarkdown =
    (
      type:
        | "bold"
        | "italic"
        | "code"
        | "block"
        | "list"
    ) => {
      setMessageText(
        (previous) => {
          switch (type) {
            case "bold":
              return (
                previous +
                "**bold text**"
              );

            case "italic":
              return (
                previous +
                "*italic text*"
              );

            case "code":
              return (
                previous +
                "`code`"
              );

            case "block":
              return (
                previous +
                "\n```javascript\n// code\n```\n"
              );

            case "list":
              return (
                previous +
                "\n- Item 1\n- Item 2"
              );

            default:
              return previous;
          }
        }
      );
    };

  return (
    <div className="flex h-full min-h-[600px] flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-slate-100">

      {/* ======================================================
          HEADER
      ====================================================== */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-5 py-4">

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>

          <div>
            <h2 className="text-sm font-bold text-white">
              {receiverName}
            </h2>

            <p className="text-[11px] text-slate-400">
              {receiverType} · Secure Chat
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            loadMessages(false)
          }
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          title="Refresh messages"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}
      {error && (
        <div className="border-b border-rose-900/50 bg-rose-950/40 px-4 py-3 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* ======================================================
          MESSAGE AREA
      ====================================================== */}
      <div className="flex-1 overflow-y-auto p-5">

        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading conversation...
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <MessageSquare className="mx-auto mb-3 h-10 w-10 text-slate-700" />

              <p className="text-sm font-semibold text-slate-400">
                No messages yet
              </p>

              <p className="mt-1 text-xs text-slate-600">
                Start a conversation with{" "}
                {receiverName}.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">

            {messages.map(
              (message) => {
                const isMine =
                  message.sender_id ===
                    currentUserId &&
                  message.sender_type ===
                    currentUserType;

                return (
                  <div
                    key={
                      message.id
                    }
                    className={`flex ${
                      isMine
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] sm:max-w-[70%] ${
                        isMine
                          ? "items-end"
                          : "items-start"
                      }`}
                    >

                      <div
                        className={`mb-1 text-[10px] text-slate-500 ${
                          isMine
                            ? "text-right"
                            : "text-left"
                        }`}
                      >
                        {isMine
                          ? currentUserName
                          : receiverName}
                      </div>

                      <div
                        className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                          isMine
                            ? "rounded-br-md bg-indigo-600 text-white"
                            : "rounded-bl-md border border-slate-800 bg-slate-900 text-slate-200"
                        }`}
                      >
                        <div
                          dangerouslySetInnerHTML={{
                            __html:
                              parseMarkdown(
                                message.message
                              ),
                          }}
                          className="break-words"
                        />
                      </div>

                      <div
                        className={`mt-1 flex items-center gap-1 text-[10px] text-slate-600 ${
                          isMine
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <span>
                          {formatTime(
                            message.created_at
                          )}
                        </span>

                        {isMine && (
                          <CheckCheck
                            className={`h-3 w-3 ${
                              Number(
                                message.is_read
                              ) === 1
                                ? "text-indigo-400"
                                : "text-slate-600"
                            }`}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              }
            )}

            <div
              ref={
                messagesEndRef
              }
            />
          </div>
        )}
      </div>

      {/* ======================================================
          COMPOSER
      ====================================================== */}
      <div className="border-t border-slate-800 bg-slate-900 p-3">

        <form
          onSubmit={
            handleSendMessage
          }
          className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950"
        >

          {/* TOOLBAR */}
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/70 px-3 py-2">

            <div className="flex items-center gap-1">

              <button
                type="button"
                onClick={() =>
                  insertMarkdown(
                    "bold"
                  )
                }
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                title="Bold"
              >
                <Bold className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() =>
                  insertMarkdown(
                    "italic"
                  )
                }
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                title="Italic"
              >
                <Italic className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() =>
                  insertMarkdown(
                    "code"
                  )
                }
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                title="Inline code"
              >
                <Code className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() =>
                  insertMarkdown(
                    "block"
                  )
                }
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                title="Code block"
              >
                <Terminal className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() =>
                  insertMarkdown(
                    "list"
                  )
                }
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                title="List"
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            <div className="flex rounded-lg bg-slate-800 p-0.5">

              <button
                type="button"
                onClick={() =>
                  setInputMode(
                    "write"
                  )
                }
                className={`flex items-center gap-1 rounded-md px-2 py-1 text-[10px] ${
                  inputMode ===
                  "write"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400"
                }`}
              >
                <Edit3 className="h-3 w-3" />
                Write
              </button>

              <button
                type="button"
                onClick={() =>
                  setInputMode(
                    "preview"
                  )
                }
                className={`flex items-center gap-1 rounded-md px-2 py-1 text-[10px] ${
                  inputMode ===
                  "preview"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400"
                }`}
              >
                <Eye className="h-3 w-3" />
                Preview
              </button>

            </div>
          </div>

          {/* INPUT */}
          {inputMode ===
          "write" ? (
            <textarea
              value={
                messageText
              }
              onChange={(event) =>
                setMessageText(
                  event.target.value
                )
              }
              onKeyDown={(
                event
              ) => {
                if (
                  event.key ===
                    "Enter" &&
                  (event.ctrlKey ||
                    event.metaKey)
                ) {
                  event.preventDefault();

                  handleSendMessage(
                    event as unknown as FormEvent<HTMLFormElement>
                  );
                }
              }}
              rows={4}
              placeholder={`Message ${receiverName}...`}
              className="w-full resize-none bg-transparent p-4 text-sm text-white outline-none placeholder:text-slate-600"
            />
          ) : (
            <div
              className="min-h-[112px] max-h-40 overflow-y-auto p-4 text-sm text-slate-200"
              dangerouslySetInnerHTML={{
                __html:
                  messageText.trim()
                    ? parseMarkdown(
                        messageText
                      )
                    : '<span class="italic text-slate-600">Nothing to preview yet...</span>',
              }}
            />
          )}

          {/* FOOTER */}
          <div className="flex items-center justify-between border-t border-slate-800 bg-slate-900/50 px-3 py-2">

            <span className="hidden text-[10px] text-slate-600 sm:block">
              {currentUserType} →{" "}
              {receiverType}
            </span>

            <button
              type="submit"
              disabled={
                !messageText.trim() ||
                isSending
              }
              className="ml-auto inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-600"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Send
                  <Send className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}