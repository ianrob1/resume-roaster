"use client";

import { useState, useRef, useCallback } from "react";

export function DonationsFooter() {
  const [copiedDonation, setCopiedDonation] = useState<string | null>(null);
  const donationCopyResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeDonationTooltip, setActiveDonationTooltip] = useState<string | null>(null);
  const [tooltipContentHovered, setTooltipContentHovered] = useState<string | null>(null);

  const hideDonationTooltip = useCallback(() => {
    setActiveDonationTooltip(null);
    setTooltipContentHovered(null);
  }, []);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedDonation(key);
    if (donationCopyResetRef.current) clearTimeout(donationCopyResetRef.current);
    donationCopyResetRef.current = setTimeout(() => setCopiedDonation(null), 1500);
  };

  return (
    <footer className="donations-footer">
      <p className="donations-triggers">
        <span
          className={`donations-trigger-wrap ${activeDonationTooltip === "zelle" || tooltipContentHovered === "zelle" ? "tooltip-visible" : ""}`}
          onMouseEnter={() => setActiveDonationTooltip("zelle")}
          onMouseLeave={hideDonationTooltip}
        >
          <span className="donations-trigger">Zelle</span>
          <span
            className={`donations-hover-content ${activeDonationTooltip === "zelle" ? "visible" : ""}`}
            role="tooltip"
            onMouseEnter={() => setTooltipContentHovered("zelle")}
            onMouseLeave={hideDonationTooltip}
          >
            <span
              className="donations-zelle-line"
              onClick={(e) => {
                e.stopPropagation();
                copy("ianrobinson95@gmail.com", "zelle");
              }}
            >
              {copiedDonation === "zelle" ? "Copied!" : "ianrobinson95@gmail.com"}
            </span>
          </span>
        </span>
        <span className="donations-sep">|</span>
        <span
          className={`donations-trigger-wrap ${activeDonationTooltip === "crypto" || tooltipContentHovered === "crypto" ? "tooltip-visible" : ""}`}
          onMouseEnter={() => setActiveDonationTooltip("crypto")}
          onMouseLeave={hideDonationTooltip}
        >
          <span className="donations-trigger">Crypto</span>
          <span
            className={`donations-hover-content donations-hover-crypto ${activeDonationTooltip === "crypto" ? "visible" : ""}`}
            role="tooltip"
            onMouseEnter={() => setTooltipContentHovered("crypto")}
            onMouseLeave={hideDonationTooltip}
          >
            <span
              className="donations-crypto-line"
              onClick={(e) => {
                e.stopPropagation();
                copy("bc1qzswva2y28kaqu8u3lukt2mf2kawcgtnh9ypp3a", "crypto-btc");
              }}
            >
              {copiedDonation === "crypto-btc" ? "Copied!" : <><span className="donations-crypto-label">BTC</span>: bc1qzswva2y28kaqu8u3lukt2mf2kawcgtnh9ypp3a</>}
            </span>
            <span
              className="donations-crypto-line"
              onClick={(e) => {
                e.stopPropagation();
                copy("0x6c207dCD2c7bD0b1f6cC5Cb3319D54662a1a62a4", "crypto-eth");
              }}
            >
              {copiedDonation === "crypto-eth" ? "Copied!" : <><span className="donations-crypto-label">ETH</span>: 0x6c207dCD2c7bD0b1f6cC5Cb3319D54662a1a62a4</>}
            </span>
            <span
              className="donations-crypto-line"
              onClick={(e) => {
                e.stopPropagation();
                copy("4Y6JzfAiAn7PckFrLqdv3h7dre1jjTqRoAGBww7XzquV", "crypto-sol");
              }}
            >
              {copiedDonation === "crypto-sol" ? "Copied!" : <><span className="donations-crypto-label">SOL</span>: 4Y6JzfAiAn7PckFrLqdv3h7dre1jjTqRoAGBww7XzquV</>}
            </span>
          </span>
        </span>
      </p>
      <p className="donations-title">Free and open source — your support helps keep it going.</p>
    </footer>
  );
}
