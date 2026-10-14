"use client";

import { useState } from "react";
import { useKeyboardShortcuts } from "@/lib/use-keyboard-shortcuts";
import KeyboardHelpDialog from "./KeyboardHelpDialog";

export default function KeyboardShortcuts() {
  const [helpOpen, setHelpOpen] = useState(false);

  useKeyboardShortcuts({
    onHelp: () => setHelpOpen(true),
  });

  return (
    <KeyboardHelpDialog
      open={helpOpen}
      onClose={() => setHelpOpen(false)}
    />
  );
}