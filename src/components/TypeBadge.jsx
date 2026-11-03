import React, { useState } from "react";
import { getTypeSvgUrl, typeColors } from "../utils/typeIcons";

export { typeColors };

export default function TypeBadge({ type, size = "md", className = "" }) {
  const typeName = typeof type === "string" ? type : type?.type?.name || "";
  const [imgError, setImgError] = useState(false);

  if (!typeName) return null;

  const cleanName = typeName.toLowerCase().trim();
  const badgeUrl = getTypeSvgUrl(cleanName);

  // Height configurations that preserve the 150x36 (~25:6) badge ratio
  const sizeClasses = {
    xs: "h-4 max-w-[65px]",
    sm: "h-5 max-w-[85px]",
    md: "h-6 sm:h-6.5 max-w-[110px]",
    lg: "h-7 sm:h-8 max-w-[130px]",
  };

  if (!badgeUrl || imgError) {
    const fallbackColor = typeColors[cleanName] || "bg-slate-700 text-white border-slate-600";
    return (
      <span
        className={`inline-flex items-center justify-center px-2 py-0.5 rounded-md font-display font-bold uppercase text-[9px] tracking-wider border shadow-xs select-none ${fallbackColor} ${className}`}
      >
        {cleanName}
      </span>
    );
  }

  return (
    <img
      src={badgeUrl}
      alt={`${cleanName} type`}
      title={`${cleanName.toUpperCase()} Type`}
      className={`inline-block w-auto object-contain select-none rounded shadow-xs drop-shadow-xs transition-transform duration-150 hover:scale-[1.03] flex-shrink-0 ${
        sizeClasses[size] || sizeClasses.md
      } ${className}`}
      loading="lazy"
      onError={() => setImgError(true)}
    />
  );
}
