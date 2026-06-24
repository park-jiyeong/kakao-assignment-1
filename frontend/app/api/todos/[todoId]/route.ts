import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ todoId: string }> }
) {
  const { todoId } = await params;
  const body = await request.json();
  const res = await fetch(`${BACKEND_URL}/todos/${todoId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ todoId: string }> }
) {
  const { todoId } = await params;
  const res = await fetch(`${BACKEND_URL}/todos/${todoId}`, {
    method: "DELETE",
  });
  if (res.status === 204) {
    return new NextResponse(null, { status: 204 });
  }
  return NextResponse.json({ error: "Delete failed" }, { status: res.status });
}
