import { createFileRoute } from "@tanstack/react-router";
import { GameCanvas } from "@/components/GameCanvas";

export const Route = createFileRoute("/play")({
  head: () => ({
    meta: [
      { title: "Oyna — Block Jumper" },
      { name: "description", content: "Canlı borsa mumlarında zıpla, dolar topla, $COIN kazan." },
    ],
  }),
  component: PlayPage,
});

function PlayPage() {
  return (
    <div className="mx-auto flex h-dvh w-full max-w-[540px] flex-col bg-[#080c14] overflow-hidden select-none">
      <GameCanvas />
    </div>
  );
}
