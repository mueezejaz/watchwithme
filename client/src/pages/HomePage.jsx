import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  const handleSend = () => {
    if (!input.trim()) return;
    navigate(`/rooms/${input.trim()}`);
  };

  return (
    <>
      <h1> hello world </h1>
      <input
        type="text"
        className="bg-red-900 text-blue-800 "
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
        }}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />
      <button onClick={handleSend}>send</button>
    </>
  );
}
