import React from "react";
import StakingModal from "../components/StakingModal";

export default function Home() {
  return (
    <div className="gigaland-home-container flex flex-col items-center min-h-screen">
      <h1 className="gigaland-title text-center mb-8 mt-12 text-3xl font-bold text-white">
        Night Club Game
      </h1>
      <StakingModal />
      {/* Puedes agregar aquí otros componentes o información */}
    </div>
  );
}
