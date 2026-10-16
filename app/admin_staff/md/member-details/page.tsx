"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Admin2ManualUpdate() {
  const router = useRouter();

  const [memberId, setMemberId] = useState("");
  const [fullName, setFullName] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("");

  const [balances, setBalances] = useState({
    savings: 0,
    loan: 0,
    fixed: 0,
    monthly: 0,
  });

  const [showBalances, setShowBalances] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!memberId) {
      setFullName("");
      setShowBalances(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/admin_staff/md/member-details?member_id=${memberId}`
        );

        const data = await response.json();

        if (data.success) {
          setFullName(data.full_name);

          setBalances({
            savings: Number(data.savings_balance),
            loan: Number(data.loan_balance),
            fixed: Number(data.fixed_balance),
            monthly: Number(data.monthly_balance),
          });

          setShowBalances(true);
        } else {
          setFullName("");
          setShowBalances(false);
        }
      } catch (error) {
        console.error("Error:", error);
        setFullName("");
        setShowBalances(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [memberId]);

  const formatMoney = (value) => {
    return Number(value).toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin_staff/md/manual-update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          member_id: Number(memberId),
          full_name: fullName,
          amount: Number(amount),
          type,
        }),
      });

      const data = await response.json();

      setMessage(data.message);

      if (data.success) {
        setAmount("");
        setType("");
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <h2>💼 MD Manual Transaction Update</h2>

      {message && <div className="alert">{message}</div>}

      <form onSubmit={handleSubmit}>
        <label htmlFor="member_id">Member ID</label>

        <input
          type="number"
          id="member_id"
          placeholder="Enter member ID"
          value={memberId}
          onChange={(e) => setMemberId(e.target.value)}
          required
        />

        <label htmlFor="full_name">Member Full Name</label>

        <input
          type="text"
          id="full_name"
          placeholder="Auto-fills after typing ID"
          value={fullName}
          readOnly
        />

        {showBalances && (
          <div className="balance-box">
            <p>
              <strong>💰 Monthly Contribution:</strong> ₦
              {formatMoney(balances.savings)}
            </p>

            <p>
              <strong>💸 Loan Balance:</strong> ₦
              {formatMoney(balances.loan)}
            </p>

            <p>
              <strong>🏦 Fixed Deposit:</strong> ₦
              {formatMoney(balances.fixed)}
            </p>

            <p>
              <strong>📅 Expected Monthly Contribution:</strong> ₦
              {formatMoney(balances.monthly)}
            </p>
          </div>
        )}

        <label htmlFor="amount">Amount (₦)</label>

        <input
          type="number"
          step="0.01"
          id="amount"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <label htmlFor="type">Transaction Type</label>

        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
        >
          <option value="">Select Type</option>
          <option value="deposit">Monthly Contribution</option>
          <option value="repayment">Loan Repayment</option>
          <option value="fixed_deposit">Fixed Deposit</option>
          <option value="monthly_contribution">
            Expected Monthly Contribution
          </option>
        </select>

        <button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Member Account"}
        </button>
      </form>

      <div className="center-container">
        <button
          type="button"
          className="back-btn"
          onClick={() => router.push("/admin_staff/md/dashboard")}
        >
          ⬅ Back to Admin Dashboard
        </button>
      </div>
    </div>
  );
}