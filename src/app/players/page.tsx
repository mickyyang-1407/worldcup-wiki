import { Suspense } from "react";
import PlayersListClient from "@/components/PlayersListClient";

export default function PlayersPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-400">載入中...</div>}>
      <PlayersListClient />
    </Suspense>
  );
}
