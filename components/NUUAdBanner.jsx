"use client";

import { useState, useEffect } from "react";

export default function NUUAdBanner() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(timer);
  }, []);

  if (dismissed) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        .nuu-ad-wrapper {
          position: fixed;
          left: 0;
          bottom: 80px;
          z-index: 999;
          font-family: 'DM Sans', sans-serif;
          transform: translateX(${visible ? "0" : "-110%"});
          transition: transform 0.55s cubic-bezier(0.34, 1.2, 0.64, 1);
        }

        .nuu-ad-card {
          background: #ffffff;
          border-radius: 0 18px 18px 0;
          box-shadow:
            0 4px 6px rgba(0,0,0,0.04),
            0 12px 40px rgba(30, 41, 100, 0.14),
            0 0 0 1px rgba(30, 41, 100, 0.07);
          width: 330px;
          overflow: hidden;
          position: relative;
        }

        .nuu-ad-top-stripe {
          height: 4px;
          background: linear-gradient(90deg, #3DCB80, #1a8f52);
          width: 100%;
        }

        .nuu-ad-inner {
          padding: 13px 15px 15px 15px;
          position: relative;
        }

        .nuu-ad-body {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 10px;
        }

        .nuu-logo-box {
          flex-shrink: 0;
          width: 84px;
          height: 84px;
          background: linear-gradient(145deg, #1a2457, #2d3a80);
          border-radius: 11px;
          display: flex;
          align-items: center;
          padding: 12px 10px 12px 14px;
          overflow: hidden;
          box-shadow: 0 3px 10px rgba(26,36,87,0.3);
          gap: 7px;
        }

        .nuu-logo-bar {
          flex-shrink: 0;
          width: 2.5px;
          align-self: stretch;
          border-radius: 2px;
          background: linear-gradient(180deg, #3DCB80, #1a8f52);
        }

        .nuu-logo-text {
          font-size: 10px;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.3;
          letter-spacing: -0.2px;
        }

        .nuu-logo-text span {
          display: block;
        }

        .nuu-content {
          flex: 1;
        }

        .nuu-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #edfaf3;
          color: #1a8f52;
          font-size: 10px;
          font-weight: 600;
          padding: 2px 7px;
          border-radius: 20px;
          margin-bottom: 5px;
          letter-spacing: 0.3px;
          text-transform: uppercase;
        }

        .nuu-tag-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #3DCB80;
          animation: pulse-dot 1.6s ease-in-out infinite;
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.7); }
        }

        .nuu-headline {
          font-size: 12.5px;
          font-weight: 600;
          color: #1a2457;
          line-height: 1.4;
          margin: 0;
        }

        .nuu-subtext {
          font-size: 11px;
          color: #6b7280;
          line-height: 1.45;
          margin: 4px 0 0 0;
        }

        .nuu-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .nuu-agency-badge {
          display: flex;
          align-items: center;
          gap: 5px;
          background: #f3f4f8;
          border-radius: 6px;
          padding: 4px 8px;
          flex: 1;
        }

        .nuu-agency-icon {
          font-size: 13px;
        }

        .nuu-agency-text {
          font-size: 9.5px;
          color: #6b7280;
          font-weight: 500;
          line-height: 1.3;
        }

        .nuu-apply-btn {
          background: linear-gradient(135deg, #1a2457, #2d3a7c);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 8px 14px;
          font-size: 11.5px;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          letter-spacing: 0.2px;
          white-space: nowrap;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 5px;
          position: relative;
          overflow: hidden;
        }

        .nuu-apply-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #3DCB80, #1a8f52);
          opacity: 0;
          transition: opacity 0.25s ease;
        }

        .nuu-apply-btn:hover::after {
          opacity: 1;
        }

        .nuu-apply-btn span {
          position: relative;
          z-index: 1;
        }

        .nuu-apply-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(26, 36, 87, 0.35);
        }

        .nuu-apply-btn:active {
          transform: translateY(0);
        }

        .nuu-dismiss {
          position: absolute;
          top: 8px;
          right: 10px;
          background: none;
          border: none;
          cursor: pointer;
          color: #d1d5db;
          font-size: 15px;
          line-height: 1;
          padding: 2px;
          transition: color 0.15s;
          z-index: 10;
        }

        .nuu-dismiss:hover {
          color: #9ca3af;
        }

        .nuu-divider {
          height: 1px;
          background: #f3f4f6;
          margin: 10px 0;
        }
      `}</style>

      <div className="nuu-ad-wrapper">
        <div className="nuu-ad-card">
          <div className="nuu-ad-top-stripe" />
          <div className="nuu-ad-inner">
            <button
              className="nuu-dismiss"
              onClick={() => setDismissed(true)}
              aria-label="Close ad"
            >
              ✕
            </button>

            <div className="nuu-ad-body">
              {/* Logo */}
              <div className="nuu-logo-box">
                <div className="nuu-logo-bar" />
                <div className="nuu-logo-text">
                  <span>New</span>
                  <span>Uzbekistan</span>
                  <span>University</span>
                </div>
              </div>

              {/* Text Content */}
              <div className="nuu-content">
                <div className="nuu-tag">
                  <div className="nuu-tag-dot" />
                  Admissions Open
                </div>
                <p className="nuu-headline">New Uzbekistan University</p>
                <p className="nuu-subtext">
                  Under the Agency for Specialized Educational Institutions
                </p>
              </div>
            </div>

            <div className="nuu-divider" />

            <div className="nuu-footer">
              <div className="nuu-agency-badge">
                <span className="nuu-agency-icon">🎓</span>
                <span className="nuu-agency-text">2026/2027<br />Applications Open</span>
              </div>
              <button
                className="nuu-apply-btn"
                onClick={() => window.open("https://admission.newuu.uz/", "_blank")}
              >
                <span>Apply Now</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
