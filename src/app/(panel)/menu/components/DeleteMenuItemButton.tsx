"use client";

type Props = {
  onClick: () => void;
};

export default function DeleteMenuItemButton({ onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs text-text-muted hover:text-red-700 transition-colors"
    >
      حذف
    </button>
  );
}