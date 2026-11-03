import React from "react";
import { TYPE_ICONS, TYPE_COLORS } from "../utils/typeVectorData";
import { typeColors } from "../utils/typeIcons";

export { typeColors };

export default function TypeBadge({ type, size = "md", className = "" }) {
  const typeName = typeof type === "string" ? type : type?.type?.name || "";
  if (!typeName) return null;

  const cleanName = typeName.toLowerCase().trim();
  const iconElement = TYPE_ICONS[cleanName] || TYPE_ICONS.normal;
  const colorData = TYPE_COLORS[cleanName] || TYPE_COLORS.normal;

  // Proportional sizing configurations for standard heights:
  // xs: 16px high (learnset compact tables)
  // sm: 20px high (cards, Damage Duel)
  // md: 24px-26px high (default main display)
  // lg: 28px-32px high (hero / modal headers)
  const sizeConfig = {
    xs: {
      container: "h-4 text-[8px] max-w-[68px]",
      iconBox: "w-4 h-4 p-[2.5px]",
      textBox: "px-1.5",
    },
    sm: {
      container: "h-5 text-[9.5px] max-w-[85px]",
      iconBox: "w-5 h-5 p-[3px]",
      textBox: "px-1.5",
    },
    md: {
      container: "h-6 sm:h-6.5 text-[11px] max-w-[110px]",
      iconBox: "w-6 sm:w-6.5 h-6 sm:h-6.5 p-[3.5px]",
      textBox: "px-2",
    },
    lg: {
      container: "h-7 sm:h-8 text-xs sm:text-[13px] max-w-[130px]",
      iconBox: "w-7 sm:w-8 h-7 sm:h-8 p-[4px]",
      textBox: "px-2.5",
    },
  }[size] || {
    container: "h-6 sm:h-6.5 text-[11px] max-w-[110px]",
    iconBox: "w-6 sm:w-6.5 h-6 sm:h-6.5 p-[3.5px]",
    textBox: "px-2",
  };

  return (
    <span
      className={`inline-flex items-center overflow-hidden rounded border border-black/20 shadow-xs select-none font-display font-black tracking-wider uppercase transition-transform duration-150 hover:scale-[1.03] flex-shrink-0 ${sizeConfig.container} ${className}`}
      style={{ backgroundColor: "#2e303d" }}
      title={`${cleanName.toUpperCase()} Type`}
      aria-label={`${cleanName} type`}
    >
      {/* Left Type Color Square with Official Vector Icon */}
      <span
        className={`h-full aspect-square flex items-center justify-center flex-shrink-0 text-white ${sizeConfig.iconBox}`}
        style={{ background: colorData.bg }}
      >
        {iconElement}
      </span>

      {/* Right Dark Capsule with Crisp Native Typography */}
      <span
        className={`flex-1 text-center text-white font-black tracking-wider leading-none truncate ${sizeConfig.textBox}`}
      >
        {cleanName}
      </span>
    </span>
  );
}
