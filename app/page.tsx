import { redirect } from "next/navigation";
import { DEFAULT_LANG } from "@/lib/dict";

export default function Root() {
  redirect(`/${DEFAULT_LANG}`);
}
