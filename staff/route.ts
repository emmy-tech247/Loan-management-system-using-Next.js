import { NextResponse } from "next/server";
import { Staff } from "@/types/staff";

// Mock data storage
let mockStaff: Staff[] = [
  {
    staff_id: 1,
    full_name: "Dr. Ibrahim Musa",
    email: "md@dcgcooperative.org",
    phone: "+234 803 111 2233",
    role: "md",
  },
  {
    staff_id: 2,
    full_name: "Aisha Mohammed",
    email: "aisha.accountant@dcgcooperative.org",
    phone: "+234 802 444 5566",
    role: "accountant",
  },
  {
    staff_id: 3,
    full_name: "Emeka Nwosu",
    email: "emeka.audit@dcgcooperative.org",
    phone: "+234 814 777 8899",
    role: "auditor",
  },
  {
    staff_id: 4,
    full_name: "Fatima Garba",
    email: "fatima.ro@dcgcooperative.org",
    phone: "+234 809 123 9900",
    role: "relationship_officer1",
  },
];

const validRoles = [
  "relationship_officer1",
  "relationship_officer2",
  "auditor",
  "manager",
  "accountant",
  "admin",
  "md",
];

// GET: Fetch all staff
export async function GET() {
  return NextResponse.json({
    success: true,
    staff: mockStaff,
  });
}

// POST: Add new staff member
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      full_name,
      email,
      phone,
      role,
      password,
    } = body;

    // Validate required fields
    if (
      !full_name ||
      !email ||
      !phone ||
      !role ||
      !password
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required.",
        },
        { status: 400 }
      );
    }

    // Validate role
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid staff role.",
        },
        { status: 400 }
      );
    }

    // Validate password
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password must contain at least 6 characters.",
        },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = email
      .trim()
      .toLowerCase();

    // Check duplicate email
    const existingStaff = mockStaff.find(
      (staff) =>
        staff.email.toLowerCase() === normalizedEmail
    );

    if (existingStaff) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A staff account with this email already exists.",
        },
        { status: 409 }
      );
    }

    // Create new staff
    const newStaff: Staff = {
      staff_id: Date.now(),
      full_name: full_name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      role,
    };

    mockStaff.unshift(newStaff);

    return NextResponse.json(
      {
        success: true,
        message: "Staff added successfully!",
        staff: newStaff,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin2/staff error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create staff account.",
      },
      { status: 500 }
    );
  }
}