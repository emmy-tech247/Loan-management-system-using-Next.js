"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

import {prisma} from "@/lib/prisma";

export async function staffLogin(formData: FormData) {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();

  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return {
      error: "All fields are required.",
    };
  }

  let role: string;
  let staffId: number;
  let fullName: string;

  try {
    const staff = await prisma.staff.findUnique({
      where: {
        email,
      },
    });

    if (!staff) {
      return {
        error: "Incorrect email or password.",
      };
    }

    const passwordValid = await bcrypt.compare(
      password,
      staff.password
    );

    if (!passwordValid) {
      return {
        error: "Incorrect email or password.",
      };
    }

    role = String(staff.role).trim().toLowerCase();

    const allowedRoles = [
      "admin",
      "auditor",
      "accountant",
      "relationship_officer1",
      "relationship_officer2",
      "manager",
      "md",
    ];

    if (!allowedRoles.includes(role)) {
      return {
        error: "Role not recognized. Contact system administrator.",
      };
    }

    staffId = staff.id;
    fullName = `${staff.firstname} ${staff.surname}`;

    const cookieStore = await cookies();

    cookieStore.set(
      "staff_session",
      JSON.stringify({
        staff_id: staffId,
        full_name: fullName,
        role,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 8,
        path: "/",
      }
    );
  } catch (error) {
    console.error("Staff login error:", error);

    return {
      error: "Unable to sign in. Please try again.",
    };
  }

  // redirect() is intentionally OUTSIDE the try/catch
  switch (role) {
    case "admin":
      redirect("/admin1");

    case "auditor":
      redirect("/auditor");

    case "accountant":
      redirect("/accountant");

    case "relationship_officer1":
      redirect("/relationship-officer1");

    case "relationship_officer2":
      redirect("/relationship-officer2");

    case "manager":
      redirect("/manager");

    case "md":
      redirect("/admin2");

    default:
      return {
        error: "Role not recognized. Contact system administrator.",
      };
  }
}