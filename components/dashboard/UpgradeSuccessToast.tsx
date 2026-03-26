"use client";

import { useEffect, useState } from "react";

export default function UpgradeSuccessToast({ show }: { show: boolean }) {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 4000);
      return () => clearTimeout(t);
    }
  }, [show]);

  if (!visible) return null;

  return (
    <div className="fixed top-5 right-5 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg text-sm font-medium bg-emerald-600 text-white">
      <span>🎉</span>
      Successfully upgraded to Pro!
    </div>
  );
}
