import { useEffect, useRef, useState } from "react";

const prefixKey = "sync_watch";

function readValue(key, initialValue) {
  try {
    const jsonValue = localStorage.getItem(key);
    if (jsonValue != null) return JSON.parse(jsonValue);
  } catch {
    console.log("some thing went wrong while getting local storage value");
  }
  return typeof initialValue === "function" ? initialValue() : initialValue;
}

export default function useLocalStorage(key, initialValue) {
  const fullKey = prefixKey + key;
  const [data, setData] = useState(readValue(fullKey, initialValue));
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
  }, []);

  useEffect(() => {
    localStorage.setItem(fullKey, JSON.stringify(data));
  }, [data]);

  return [data, setData];
}
