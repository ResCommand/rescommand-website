"use client";
import { useState } from "react";

const ICON_GROUPS: { label: string; icons: string[] }[] = [
  { label: "Food & Drink", icons: [
    "🍩", "🧁", "🎂", "🍰", "🥧", "🍪", "🍞", "🥐", "🥖", "🥯",
    "☕", "🧋", "🍵", "🥤", "🧃", "🍺", "🥛", "🍯", "🫖", "🧊",
    "🍳", "🥚", "🥓", "🥞", "🧇", "🥪", "🌮", "🌯", "🍕", "🍔",
    "🌭", "🥗", "🥘", "🍝", "🍜", "🍲", "🍛", "🍣", "🥟", "🍤",
  ]},
  { label: "Kitchen", icons: [
    "🍳", "🥄", "🍴", "🔪", "🫕", "🥣", "🧈", "🧂", "🫙", "🏺",
    "🔪", "🧴", "💡", "🔥", "⏰", "⏱️", "🌡️", "⚖️", "🧽", "🧹",
  ]},
  { label: "Produce & Ingredients", icons: [
    "🍎", "🍊", "🍋", "🍌", "🍓", "🫐", "🍇", "🍑", "🥭", "🍍",
    "🥥", "🫒", "🌶️", "🥕", "🧅", "🧄", "🥔", "🌽", "🥦", "🥬",
    "🧀", "🥩", "🍗", "🍖", "🐟", "🐠", "🦐", "🦀", "🦞", "🥜",
  ]},
  { label: "People & Roles", icons: [
    "👨‍🍳", "👩‍🍳", "🧑‍🍳", "👷", "👷‍♀️", "🧑‍💼", "👨‍💼", "👩‍💼",
    "🧑‍🤝‍🧑", "👥", "🤝", "💪", "👏", "👍", "⭐", "🏆",
  ]},
  { label: "Safety & Signs", icons: [
    "⚠️", "🚨", "🛑", "⛔", "☢️", "☣️", "🔥", "💧", "🧯", "🩹",
    "✅", "❌", "❗", "❓", "🆗", "🆒", "🆕", "💯", "🔒", "🔑",
  ]},
  { label: "Operations", icons: [
    "📋", "📝", "📄", "📑", "📊", "📈", "📉", "🗓️", "📅", "🗂️",
    "📁", "📂", "📦", "🚚", "🛒", "🛍️", "💰", "💵", "💳", "🧾",
    "📱", "💻", "🖨️", "📧", "🔔", "📣", "📢", "🏷️", "🎁", "🎯",
  ]},
  { label: "Building & Facilities", icons: [
    "🏠", "🏢", "🏪", "🏫", "🏭", "🚪", "🪟", "🛗", "🧹", "🧺",
    "🚿", "🚰", "🧻", "🗑️", "♻️", "🧊", "❄️", "🌨️", "☀️", "🌙",
  ]},
  { label: "General", icons: [
    "📦", "⭐", "❤️", "💛", "💚", "💙", "💜", "🧡", "🖤", "🤍",
    "🎯", "🎨", "🧩", "🔧", "⚙️", "🔨", "🛠️", "🏗️", "⚡", "✨",
    "🎉", "🎊", "🎈", "💫", "🌟", "🌈", "🍀", "🌸", "🌺", "🌻",
  ]},
];

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  label?: string;
}

export default function IconPicker({ value, onChange, label = "Icon" }: IconPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <label className="form-label">{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          style={{
            width: 44, height: 44, fontSize: 22, display: "flex",
            alignItems: "center", justifyContent: "center",
            border: "1px solid #D1D5DB", borderRadius: 6, background: "#fff",
            cursor: "pointer",
          }}
        >
          {value || "📦"}
        </button>
        <span className="text-sm text-gray">{value ? `Current: ${value}` : "Pick an icon"}</span>
      </div>
      {open && (
        <div
          style={{
            marginTop: 8, border: "1px solid #E5E7EB", borderRadius: 8,
            background: "#fff", maxHeight: 280, overflowY: "auto",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          {ICON_GROUPS.map((group) => (
            <div key={group.label} style={{ padding: "8px 12px" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                {group.label}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                {group.icons.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => { onChange(icon); setOpen(false); }}
                    style={{
                      width: 36, height: 36, fontSize: 20,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      border: "none", borderRadius: 4, cursor: "pointer",
                      background: icon === value ? "#EFF6FF" : "transparent",
                      outline: icon === value ? "2px solid #1A56DB" : "none",
                    }}
                    title={icon}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}