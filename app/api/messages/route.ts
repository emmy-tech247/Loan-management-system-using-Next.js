import { NextResponse } from "next/server";

// Sample mock storage for illustration (Replace with DB queries using MySQL/Prisma/Drizzle)
let mockMessages: Array<{
  id: number;
  sender_id: number;
  receiver_id: number;
  sender_type: "member" | "admin";
  message: string;
  created_at: string;
}> = [
  {
    id: 1,
    sender_id: 1,
    receiver_id: 101,
    sender_type: "admin",
    message: "Hello! Welcome to DCG Cooperative support. How can I assist you with your loan or fixed deposit today?",
    created_at: "2026-07-31T05:30:00Z",
  },
  {
    id: 2,
    sender_id: 101,
    receiver_id: 1,
    sender_type: "member",
    message: "Hi Admin, I submitted my receipt for fixed deposit renewal yesterday. Could you please confirm approval?",
    created_at: "2026-07-31T05:35:00Z",
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const adminId = parseInt(searchParams.get("admin_id") || "1");

  // Filter messages exchanged between member and selected admin
  const filtered = mockMessages.filter(
    (m) =>
      (m.sender_type === "member" && m.receiver_id === adminId) ||
      (m.sender_type === "admin" && m.sender_id === adminId)
  );

  return NextResponse.json(filtered);
}

export async function POST(request: Request) {
  try {
    const { message, admin_id } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message content cannot be empty" }, { status: 400 });
    }

    const newMessage = {
      id: Date.now(),
      sender_id: 101, // Authenticated member ID
      receiver_id: Number(admin_id),
      sender_type: "member" as const,
      message: message.trim(),
      created_at: new Date().toISOString(),
    };

    mockMessages.push(newMessage);

    return NextResponse.json(newMessage, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 });
  }
}
