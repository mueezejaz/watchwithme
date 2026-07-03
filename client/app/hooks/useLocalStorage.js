"use client";
import { useEffect, useState } from "react";

const prefixKey = "sync_watch";
export default function useLocalStorage(key, initialValue) {
  const fullKey = prefixKey + key;
  const [data, setData] = useState(null);

  useEffect(() => {
    const jsonValue = localStorage.getItem(fullKey);
    console.log("this is json value", jsonValue);
    if (jsonValue != null) {
      setData(JSON.parse(jsonValue));
      return;
    }
    if (typeof initialValue === "function") {
      setData(() => {
        return initialValue();
      });
      return;
    } else {
      setData(initialValue);
    }
  }, [fullKey]);
  useEffect(() => {
    if (data === null) return;
    localStorage.setItem(fullKey, JSON.stringify(data));
    console.log("saved");
  }, [data]);

  return [data, setData];
}
