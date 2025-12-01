import { useState } from "react";
import AIChallengeModal from "./AIChallengeModal.jsx";

const AIChallengeButton = ({ onCreated }) => {
  const [isOpen, setOpen] = useState(false);

  return (
    <>
      <button type="button" className="nav-link" onClick={() => setOpen(true)}>
        Generate Challenge (AI)
      </button>
      {isOpen && <AIChallengeModal onClose={() => setOpen(false)} onCreated={onCreated} />}
    </>
  );
};

export default AIChallengeButton;
