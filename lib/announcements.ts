import { Announcement } from "@/types/announcement";

export const sampleAnnouncements: Announcement[] = [
  {
    id: "anc-1",
    title: "Annual General Meeting (AGM) Notice & Dividend Payout Schedule",
    content:
      "Dear Members, we are pleased to announce that the Annual General Meeting (AGM) for DCG Multipurpose Cooperative Society Ltd will be held next month. Dividend distribution schedules for eligible members who completed the 12-month savings cycle without premature withdrawals will be reviewed during this session. Please log in to your portal regularly to inspect official documents and voting parameters.",
    created_at: "2026-07-25T10:30:00Z",
    expiry_date: "2026-08-30T23:59:59Z",
    priority: "urgent",
  },
  {
    id: "anc-2",
    title: "Updated Interest Rates for Fixed Deposit-Backed Loans",
    content:
      "Effective immediately, fixed deposit-backed loan terms have been updated to streamline approval cycles. Members borrowing against existing fixed deposits can enjoy immediate approval within 30 minutes without affecting their base dividend calculations.",
    created_at: "2026-07-18T14:15:00Z",
    expiry_date: "2026-09-01T23:59:59Z",
    priority: "normal",
  },
  {
    id: "anc-3",
    title: "Scheduled System Maintenance Window",
    content:
      "Please be informed that the loan portal will undergo routine database optimization and security maintenance on Sunday from 02:00 AM to 04:00 AM WAT. Live chat and loan status applications may be temporarily unavailable during this timeframe.",
    created_at: "2026-07-10T09:00:00Z",
    expiry_date: "2026-08-05T23:59:59Z",
    priority: "normal",
  },
];
