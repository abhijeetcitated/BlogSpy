import React from "react"

type EmailLayoutProps = {
  title: string
  preview?: string
  unsubscribeUrl: string
  children: React.ReactNode
}

const containerStyle: React.CSSProperties = {
  margin: 0,
  padding: 0,
  backgroundColor: "#0f172a",
  fontFamily: "Arial, sans-serif",
}

const cardStyle: React.CSSProperties = {
  maxWidth: "640px",
  margin: "0 auto",
  backgroundColor: "#111827",
  borderRadius: "16px",
  overflow: "hidden",
  border: "1px solid rgba(255, 255, 255, 0.08)",
}

const headerStyle: React.CSSProperties = {
  backgroundColor: "#0b0f1a",
  padding: "24px 32px",
  borderBottom: "1px solid rgba(255, 215, 0, 0.2)",
}

const brandStyle: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: 700,
  letterSpacing: "0.3px",
}

const titleStyle: React.CSSProperties = {
  margin: "12px 0 0",
  fontSize: "18px",
  color: "#f8fafc",
}

const contentStyle: React.CSSProperties = {
  padding: "28px 32px",
  color: "#e2e8f0",
  fontSize: "14px",
  lineHeight: 1.6,
}

const footerStyle: React.CSSProperties = {
  padding: "20px 32px 28px",
  color: "#94a3b8",
  fontSize: "12px",
  textAlign: "center",
  borderTop: "1px solid rgba(255, 255, 255, 0.06)",
}

export function EmailLayout({ title, preview, unsubscribeUrl, children }: EmailLayoutProps) {
  return (
    <div style={containerStyle}>
      {preview ? (
        <span style={{ display: "none", visibility: "hidden", opacity: 0, color: "transparent" }}>
          {preview}
        </span>
      ) : null}
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ padding: "32px 16px" }}>
        <tbody>
          <tr>
            <td>
              <div style={cardStyle}>
                <div style={headerStyle}>
                  <div style={brandStyle}>
                    <span style={{ color: "#ffffff" }}>Cita</span>
                    <span style={{ color: "#FFD700" }}>Ted</span>
                  </div>
                  <h1 style={titleStyle}>{title}</h1>
                </div>
                <div style={contentStyle}>{children}</div>
                <div style={footerStyle}>
                  <p style={{ margin: 0 }}>
                    You are receiving this email because you subscribed to Citated updates.
                  </p>
                  <p style={{ margin: "8px 0 0" }}>
                    <a href={unsubscribeUrl} style={{ color: "#FFD700", textDecoration: "none" }}>
                      Unsubscribe
                    </a>
                  </p>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
