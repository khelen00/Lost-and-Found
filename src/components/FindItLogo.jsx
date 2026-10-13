import React from "react";

export default function FindItLogo({ size = 40, className = "" }) {
    return (
        <svg
            className={className}
            width={size}
            height={size}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="FindIt logo"
        >

            {/* Magnifying glass */}
            <circle
                cx="22"
                cy="18"
                r="7"
                stroke="#FFFFFF"
                strokeWidth="3.5"
            />
            <path
                d="M27 23L34 30"
                stroke="#FFFFFF"
                strokeWidth="3.5"
                strokeLinecap="round"
            />
        </svg>
    );
}