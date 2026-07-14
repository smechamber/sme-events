import { NextResponse } from "next/server";
import { ZodError } from "zod";

export const corsHeaders = {
  "Access-Control-Allow-Origin":
    process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3001",
  "Access-Control-Allow-Methods":
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization",
};

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(
    { data },
    {
      status,
      headers: corsHeaders,
    }
  );
}

export function fail(error: unknown, status = 500) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "VALIDATION_ERROR",
        details: error.flatten(),
      },
      {
        status: 400,
        headers: corsHeaders,
      }
    );
  }

  const message =
    error instanceof Error ? error.message : "SERVER_ERROR";

  return NextResponse.json(
    {
      error: message,
    },
    {
      status,
      headers: corsHeaders,
    }
  );
}

export function options() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}