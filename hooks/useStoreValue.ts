"use client";
import { useEffect, useState } from "react";

type Subscribable<T> = { value: T; subscribe: (listener: (v: T) => void) => () => void };

export function useStoreValue<T>(signal: Subscribable<T>) {
  const [value, setValue] = useState(signal.value);
  useEffect(() => signal.subscribe(setValue), [signal]);
  return value;
}
