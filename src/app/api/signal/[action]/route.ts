import { NextRequest, NextResponse } from "next/server";

// In-memory signal store
interface SignalMessage {
  type: string;
  data: unknown;
  from: "host" | "guest";
  timestamp: number;
}

interface Room {
  hostMessages: SignalMessage[];
  guestMessages: SignalMessage[];
  guestJoined: boolean;
  created: number;
}

const g = global as unknown as { _duosnapRooms?: Map<string, Room> };
const rooms: Map<string, Room> = g._duosnapRooms ?? (g._duosnapRooms = new Map());

function generateRoomCode(): string {
  const words = ["ROSE", "LOVE", "KISS", "STAR", "MOON", "SOUL", "DEAR", "PINK", "GLOW", "WARM"];
  const word = words[Math.floor(Math.random() * words.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${word}-${num}`;
}

function cleanOldRooms() {
  const now = Date.now();
  for (const [code, room] of rooms.entries()) {
    if (now - room.created > 2 * 60 * 60 * 1000) rooms.delete(code);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ action: string }> }
) {
  const { action } = await params;
  const url = new URL(request.url);

  if (action === "create-room") {
    cleanOldRooms();
    let code = generateRoomCode();
    while (rooms.has(code)) code = generateRoomCode();
    rooms.set(code, {
      hostMessages: [],
      guestMessages: [],
      guestJoined: false,
      created: Date.now(),
    });
    return NextResponse.json({ success: true, code });
  }

  if (action === "poll") {
    const code = url.searchParams.get("code");
    const role = url.searchParams.get("role") as "host" | "guest" | null;
    const since = parseInt(url.searchParams.get("since") || "0", 10);

    if (!code || !role) return NextResponse.json({ error: "Missing params" }, { status: 400 });

    const room = rooms.get(code);
    if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

    // Messages intended for this role come from the OTHER role
    const messages = role === "host" ? room.guestMessages : room.hostMessages;
    const newMessages = messages.filter((m) => m.timestamp > since);

    return NextResponse.json({ success: true, messages: newMessages, guestJoined: room.guestJoined });
  }

  if (action === "check-room") {
    const code = url.searchParams.get("code");
    if (!code) return NextResponse.json({ exists: false });
    return NextResponse.json({ exists: rooms.has(code) });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ action: string }> }
) {
  const { action } = await params;

  if (action === "signal") {
    const body = await request.json() as {
      code: string;
      role: "host" | "guest";
      type: string;
      data: unknown;
    };
    const { code, role, type, data } = body;

    const room = rooms.get(code);
    if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

    const message: SignalMessage = { type, data, from: role, timestamp: Date.now() };

    if (role === "host") {
      room.hostMessages.push(message);
      if (room.hostMessages.length > 50) room.hostMessages.splice(0, room.hostMessages.length - 50);
    } else {
      room.guestMessages.push(message);
      if (type === "join") room.guestJoined = true;
      if (room.guestMessages.length > 50) room.guestMessages.splice(0, room.guestMessages.length - 50);
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
