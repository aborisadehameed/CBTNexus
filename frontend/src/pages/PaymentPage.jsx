import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext, api } from "../context/AuthContext";
import "../custom-theme.css";

const PaymentPage = () => {
  const { user, updateUser, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [paymentConfig, setPaymentConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [completedRef, setCompletedRef] = useState("");
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const activationPollRef = useRef(null);

  // After the Paystack popup closes (either via callback or user closing it),
  // poll /payment/status every 5s for up to 2 minutes to catch webhook-activated accounts
  const startActivationPoll = (txRef) => {
    let attempts = 0;
    const MAX_ATTEMPTS = 24; // 24 × 5s = 2 minutes
    activationPollRef.current = setInterval(async () => {
      attempts++;
      try {
        // Try to verify the specific reference first
        const verifyRes = await api.post("/payment/verify", { reference: txRef, trxref: txRef });
        if (verifyRes.data?.success) {
          clearInterval(activationPollRef.current);
          updateUser({ isPaid: true, paidAt: new Date() });
          setPaymentConfirmed(true);
          setSuccessMessage("Payment successful! You now have Lifetime Access.");
          setIsProcessing(false);
          return;
        }
      } catch {
        // verify failed, fall through to status check
      }
      try {
        // Also check if webhook already activated account
        const statusRes = await api.get("/payment/status");
        if (statusRes.data?.isPaid) {
          clearInterval(activationPollRef.current);
          updateUser({ isPaid: true, paidAt: statusRes.data.paidAt || new Date() });
          setPaymentConfirmed(true);
          setSuccessMessage("Payment confirmed! You now have Lifetime Access.");
          setIsProcessing(false);
          return;
        }
      } catch { /* ignore */ }

      if (attempts >= MAX_ATTEMPTS) {
        clearInterval(activationPollRef.current);
        setIsProcessing(false);
      }
    }, 5000);
  };

  // Cleanup poll on unmount
  useEffect(() => {
    return () => {
      if (activationPollRef.current) clearInterval(activationPollRef.current);
    };
  }, []);

  // Fetch payment configuration directly
  useEffect(() => {
    const fetchConfig = async () => {
      setLoadingConfig(true);
      setErrorMessage("");
      try {
        const res = await api.get("/payment/config");
        setPaymentConfig(res.data);
      } catch (err) {
        console.error("Failed to load payment config:", err);
        setErrorMessage("Unable to load fee details. Please refresh or try again.");
      } finally {
        setLoadingConfig(false);
      }
    };

    fetchConfig();
  }, []);

  // Helper to ensure Paystack script is loaded in DOM
  const loadPaystackScript = () => {
    return new Promise((resolve) => {
      if (typeof window.PaystackPop !== "undefined") {
        return resolve(true);
      }
      // Check if tag already exists
      const existing = document.querySelector('script[src*="paystack"]');
      if (existing) {
        existing.addEventListener("load", () => resolve(true));
        existing.addEventListener("error", () => resolve(false));
        // In case it already finished loading
        setTimeout(() => resolve(typeof window.PaystackPop !== "undefined"), 1500);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Handle Paystack checkout
  const handleCheckout = async () => {
    if (!paymentConfig) return;
    setIsProcessing(true);
    setErrorMessage("");

    try {
      const txRef = `CBT_DIRECT_${user?._id || "USER"}_${Date.now()}`;
      const { publicKey, amount, currency } = paymentConfig;

      // Convert amount to minor currency unit (kobo/cents) for Paystack
      const amountInKobo = Math.round(Number(amount) * 100);

      // Ensure Paystack library is loaded
      await loadPaystackScript();

      // 1. If Paystack popup script is loaded and public key is configured
      if (typeof window.PaystackPop !== "undefined" && publicKey && publicKey.startsWith("pk_")) {
        const handler = window.PaystackPop.setup({
          key: publicKey,
          email: user?.email || "student@example.com",
          amount: amountInKobo,
          currency: currency || "NGN",
          ref: txRef,
          metadata: {
            custom_fields: [
              {
                display_name: "Student Name",
                variable_name: "student_name",
                value: user?.name || "Student",
              },
              {
                display_name: "Plan",
                variable_name: "plan",
                value: "Lifetime CBT Access",
              },
            ],
          },
          callback: function (response) {
            setIsProcessing(true);
            const ref = response.reference || txRef;
            setCompletedRef(ref);
            setShowPendingModal(true);

            api.post("/payment/verify", {
              reference: ref,
              trxref: response.trxref || txRef,
            })
              .then((verifyRes) => {
                if (verifyRes.data?.success) {
                  updateUser({ isPaid: true, paidAt: new Date() });
                  setPaymentConfirmed(true);
                  setSuccessMessage("Payment verified successfully! Lifetime access unlocked.");
                } else {
                  // Verification didn't confirm yet — start polling as fallback
                  setSuccessMessage("Payment received! Confirming your access in the background...");
                  startActivationPoll(ref);
                }
              })
              .catch(() => {
                // Network/server error — start polling as fallback so webhook can activate
                setSuccessMessage("Payment received! Confirming your access in the background...");
                startActivationPoll(ref);
              })
              .finally(() => {
                setIsProcessing(false);
              });
          },
          onClose: function () {
            // Check if payment was initiated or completed via redirect/bank transfer
            if (!paymentConfirmed) {
              setCompletedRef(txRef);
              setShowPendingModal(true);
              startActivationPoll(txRef);
            }
          },
        });

        handler.openIframe();
        setIsProcessing(false);
      } else {
        // 2. Development Sandbox / Mock Simulation if test key or sandbox mode
        const verifyRes = await api.post("/payment/verify", {
          reference: txRef,
          trxref: txRef,
        });

        if (verifyRes.data?.success) {
          updateUser({ isPaid: true, paidAt: new Date() });
          setPaymentConfirmed(true);
          setCompletedRef(txRef);
          setShowPendingModal(true);
          setSuccessMessage("Sandbox/Test verification successful! Lifetime access granted.");
        } else {
          setErrorMessage("Mock payment failed to register.");
        }
        setIsProcessing(false);
      }
    } catch (err) {
      console.error("Payment error:", err);
      setErrorMessage(err.message || "Failed to initiate payment. Please try again.");
      setIsProcessing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="loader-container min-h-screen">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="payment-wrapper" style={{ maxWidth: "760px", margin: "2rem auto", padding: "0 1rem" }}>
      <div
        className="glass-card payment-card"
        style={{
          background: "hsl(var(--bg-secondary))",
          border: "1px solid hsl(var(--border))",
          borderRadius: "16px",
          padding: "clamp(1.25rem, 4vw, 2.5rem)",
          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.08)",
        }}
      >
        {/* Back Link */}
        <div style={{ marginBottom: "1.5rem" }}>
          <Link
            to="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "hsl(var(--text-muted))",
              fontSize: "0.95rem",
              fontWeight: "600",
            }}
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem", color: "var(--text-main)" }}>
            Unlock Lifetime CBT Access
          </h1>
          <p style={{ color: "hsl(var(--text-muted))", fontSize: "1.05rem", maxWidth: "540px", margin: "0 auto" }}>
            Make a one-time payment to unlock unlimited tests, detailed performance metrics, and post-exam arcade relaxation.
          </p>
        </div>

        {/* Current Status Badge */}
        {user?.isPaid ? (
          <div
            style={{
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              color: "#10b981",
              padding: "1rem",
              borderRadius: "12px",
              textAlign: "center",
              fontWeight: "700",
              fontSize: "1.1rem",
              marginBottom: "2rem",
            }}
          >
            You already have Lifetime Access! No further payment is needed.
          </div>
        ) : (
          <div
            style={{
              background: "rgba(245, 158, 11, 0.08)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              borderRadius: "12px",
              padding: "1.2rem",
              marginBottom: "2rem",
            }}
          >
            <h3 style={{ fontSize: "1rem", color: "#d97706", marginBottom: "0.4rem" }}>
              Trial Account Notice
            </h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-main)", margin: 0, lineHeight: "1.5" }}>
              Without unlocking, assessments will be restricted by a <strong>5-minute trial cutoff</strong> that pauses your exam and prompts for payment before you can finish or record your score.
            </p>
          </div>
        )}

        {/* Price Card */}
        <div
          style={{
            border: "2px solid hsl(var(--primary))",
            borderRadius: "16px",
            padding: "2rem",
            textAlign: "center",
            background: "rgba(47, 158, 157, 0.04)",
            marginBottom: "2rem",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-12px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "hsl(var(--primary))",
              color: "#fff",
              padding: "0.2rem 1rem",
              borderRadius: "50px",
              fontSize: "0.8rem",
              fontWeight: "700",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            One-Time Payment
          </div>

          {loadingConfig ? (
            <div style={{ padding: "1.5rem", color: "hsl(var(--text-muted))" }}>Loading pricing...</div>
          ) : (
            <div>
              <div style={{ fontSize: "3rem", fontWeight: "800", color: "var(--text-main)", lineHeight: "1" }}>
                <span style={{ fontSize: "2rem", verticalAlign: "top", marginRight: "0.25rem" }}>
                  {paymentConfig?.currencySymbol}
                </span>
                {paymentConfig?.amount?.toLocaleString()}
                <span style={{ fontSize: "1.1rem", fontWeight: "600", color: "hsl(var(--text-muted))", marginLeft: "0.5rem" }}>
                  {paymentConfig?.currency}
                </span>
              </div>
              <p style={{ marginTop: "0.75rem", color: "hsl(var(--text-muted))", fontSize: "0.95rem" }}>
                No subscriptions • No renewal fees • Lifetime validity
              </p>
            </div>
          )}

          {/* Benefits list */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "0.8rem",
              marginTop: "1.5rem",
              textAlign: "left",
            }}
          >
            <div style={{ fontSize: "0.9rem", color: "var(--text-main)" }}>
              Unlimited CBT Practice Tests
            </div>
            <div style={{ fontSize: "0.9rem", color: "var(--text-main)" }}>
              Zero 5-minute timeout interruptions
            </div>
            <div style={{ fontSize: "0.9rem", color: "var(--text-main)" }}>
              Full Solutions & Detailed Corrections
            </div>
            <div style={{ fontSize: "0.9rem", color: "var(--text-main)" }}>
              Access to Post-Exam Arcade Zone
            </div>
          </div>
        </div>

        {/* Feedback alerts */}
        {errorMessage && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#dc2626",
              padding: "0.8rem 1rem",
              borderRadius: "8px",
              marginBottom: "1.5rem",
              fontWeight: "600",
              fontSize: "0.95rem",
            }}
          >
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div
            style={{
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              color: "#059669",
              padding: "0.8rem 1rem",
              borderRadius: "8px",
              marginBottom: "1.5rem",
              fontWeight: "600",
              fontSize: "0.95rem",
              textAlign: "center",
            }}
          >
            {successMessage}
          </div>
        )}

        {/* Action Button */}
        {!user?.isPaid && (
          <button
            onClick={handleCheckout}
            disabled={isProcessing || loadingConfig}
            style={{
              width: "100%",
              padding: "1rem 1.5rem",
              background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              fontSize: "1.1rem",
              fontWeight: "700",
              cursor: isProcessing || loadingConfig ? "not-allowed" : "pointer",
              boxShadow: "0 6px 20px rgba(47, 158, 157, 0.35)",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
            }}
          >
            {isProcessing ? "Processing Secure Payment..." : `Pay ${paymentConfig?.currencySymbol || ""}${paymentConfig?.amount?.toLocaleString() || ""} & Unlock Now`}
          </button>
        )}

        <div style={{ textAlign: "center", marginTop: "1.2rem", fontSize: "0.8rem", color: "hsl(var(--text-muted))" }}>
          Payments securely processed via Paystack. Supports Cards, Bank Transfer, USSD, and Mobile Money.
        </div>
      </div>

      {/* Post-Payment Notice Popup Modal (24 Hours Activation Notice) */}
      {showPendingModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(10, 15, 30, 0.8)",
            backdropFilter: "blur(6px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            animation: "fadeIn 0.25s ease",
          }}
        >
          <div
            className="glass-card"
            style={{
              width: "100%",
              maxWidth: "480px",
              background: "#ffffff",
              border: "2px solid #2F9E9D",
              borderRadius: "20px",
              padding: "clamp(1.5rem, 4vw, 2.2rem)",
              textAlign: "center",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.35)",
              position: "relative",
            }}
          >
            {/* Header Icon */}
            <div
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(47, 158, 157, 0.15), rgba(245, 158, 11, 0.2))",
                border: "2px solid #2F9E9D",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.2rem",
                fontSize: "2.2rem",
                boxShadow: "0 8px 24px rgba(47, 158, 157, 0.25)",
              }}
            >
              ⏱️
            </div>

            <h2
              style={{
                fontSize: "1.45rem",
                fontWeight: "800",
                color: "#1a1a2e",
                marginBottom: "0.4rem",
              }}
            >
              Payment Completed
            </h2>

            <p style={{ color: "#64748b", fontSize: "0.92rem", marginBottom: "1.2rem", lineHeight: "1.5" }}>
              Thank you! Your payment transaction has been processed.
            </p>

            {/* Prominent 24-Hour Notice Box */}
            <div
              style={{
                background: "rgba(245, 158, 11, 0.1)",
                border: "1.5px solid rgba(245, 158, 11, 0.45)",
                borderRadius: "14px",
                padding: "1rem 1.15rem",
                marginBottom: "1.25rem",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#b45309",
                  fontWeight: "700",
                  fontSize: "0.95rem",
                  marginBottom: "0.35rem",
                }}
              >
                <span>⚠️</span>
                <span>Important: Takes Up to 24 Hours</span>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.88rem",
                  color: "#78350f",
                  lineHeight: "1.55",
                  fontWeight: "500",
                }}
              >
                Please note that account activation and banking network synchronization may take <strong>up to 24 hours</strong> to be fully verified and reflected across all your CBT tests.
              </p>
            </div>

            <p style={{ fontSize: "0.85rem", color: "#64748b", lineHeight: "1.5", marginBottom: "1.25rem" }}>
              {paymentConfirmed
                ? "Your payment is verified! If your dashboard or test access does not immediately show full activation, please allow up to 24 hours for system synchronization."
                : "Once confirmed by the payment gateway, your Lifetime Access will be unlocked automatically. Our admin team monitors all incoming payments."}
            </p>

            {completedRef && (
              <div
                style={{
                  background: "rgba(47, 158, 157, 0.08)",
                  border: "1px dashed rgba(47, 158, 157, 0.4)",
                  borderRadius: "8px",
                  padding: "0.5rem 0.75rem",
                  fontSize: "0.8rem",
                  color: "#0f766e",
                  fontFamily: "monospace",
                  marginBottom: "1.25rem",
                  wordBreak: "break-all",
                }}
              >
                Reference: {completedRef}
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={() => {
                setShowPendingModal(false);
                navigate("/dashboard");
              }}
              style={{
                width: "100%",
                padding: "0.9rem",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #2F9E9D, #1a6060)",
                color: "#fff",
                fontWeight: "700",
                fontSize: "1rem",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 6px 20px rgba(47, 158, 157, 0.35)",
                transition: "transform 0.15s ease",
              }}
            >
              I Understand · Go to Dashboard
            </button>

            <div style={{ marginTop: "0.9rem", fontSize: "0.78rem", color: "#94a3b8" }}>
              Need urgent help? Support Line: <strong>08032249468</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
