import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { nanoid } from "nanoid";

export default function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(`/rooms/${nanoid(8)}`, { replace: true });
  }, [navigate]);

  return null;
}
