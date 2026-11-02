import { redirect } from "next/navigation";
import { ROTA_INICIAL } from "@/lib/sessao";

export default function Home() {
  redirect(ROTA_INICIAL);
}
