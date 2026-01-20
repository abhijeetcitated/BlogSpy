"use client"

/**
 * ============================================
 * GLOBAL ERROR PAGE
 * ============================================
 * 
 * Catches errors in the root layout and displays a user-friendly UI.
 * 
 * IMPORTANT: This file must use inline styles only because:
 * - globals.css is not loaded when global-error triggers
 * - Tailwind classes won't work here
 * 
 * @version 1.1.0
 */

import { useEffect } from "react"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Global error:", error)
  }, [error])

  return (
    <html lang="en">
      <head>
        <title>Error | BlogSpy</title>
      </head>
      <body style={{ 
        margin: 0, 
        fontFamily: "system-ui, -apple-system, sans-serif", 
        backgroundColor: "#fafafa",
        color: "#171717"
      }}>
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px"
        }}>
          <div style={{
            maxWidth: "420px",
            width: "100%",
            backgroundColor: "white",
            border: "1px solid #e5e5e5",
            borderRadius: "12px",
            padding: "32px",
            textAlign: "center",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
          }}>
            {/* Icon */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
              <div style={{
                width: "64px",
                height: "64px",
                backgroundColor: "#fee2e2",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
            </div>

            {/* Title */}
            <h1 style={{ 
              fontSize: "20px", 
              fontWeight: 600, 
              marginBottom: "8px",
              marginTop: 0
            }}>
              Something went wrong!
            </h1>

            {/* Description */}
            <p style={{ 
              color: "#737373", 
              marginBottom: "24px",
              fontSize: "14px",
              lineHeight: "1.5"
            }}>
              We apologize for the inconvenience. An unexpected error has occurred.
              Our team has been notified and is working on a fix.
            </p>

            {/* Actions */}
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={() => reset()}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "1px solid #e5e5e5",
                  backgroundColor: "white",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 4 23 10 17 10"/>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                </svg>
                Try Again
              </button>

              <button
                onClick={() => (window.location.href = "/dashboard")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "#171717",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                Go to Dashboard
              </button>
            </div>

            {/* Support link */}
            <p style={{ marginTop: "24px", fontSize: "14px", color: "#737373" }}>
              If this problem persists, please{" "}
              <a
                href="/contact"
                style={{ color: "#2563eb", textDecoration: "none" }}
              >
                contact support
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}
