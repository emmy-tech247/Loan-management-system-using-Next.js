import { NextResponse } from "next/server";
import { Staff } from "@/types/staff";

// Mock data storage representing database results
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

// GET: Fetch all staff accounts
export async function GET() {
  return NextResponse.json(mockStaff);
}

// POST: Add new staff member
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { full_name, email, phone, role, password } = body;

    if (!full_name || !email || !phone || !role || !password) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    const newStaff: Staff = {
      staff_id: Date.now(),
      full_name,
      email,
      phone,
      role,
    };

    mockStaff.unshift(newStaff);

    return NextResponse.json(
      { message: "Staff added successfully!", staff: newStaff },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to create staff account." },
      { status: 500 }
    );
  }
}

// DELETE: Remove a staff member by ID
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const staff_id = searchParams.get("staff_id");

    if (!staff_id) {
      return NextResponse.json(
        { error: "Staff ID is required." },
        { status: 400 }
      );
    }

    const id = Number(staff_id);
    mockStaff = mockStaff.filter((s) => s.staff_id !== id);

    return NextResponse.json({ message: "Staff deleted successfully!" });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete staff member." },
      { status: 500 }
    );
  }
}
