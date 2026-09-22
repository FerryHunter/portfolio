"use client";

import { useEffect } from "react";
import { initAll } from "@/motion/index.js";

/**
 * Satu-satunya client component di halaman. Semua logika
 * interaksi hidup di motion/*.js (vanilla ESM) supaya bisa
 * dipakai identik oleh preview statis.
 */
export default function MotionRoot() {
  useEffect(() => initAll(document), []);
  return null;
}
