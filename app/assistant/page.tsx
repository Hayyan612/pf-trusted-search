import { AssistantApp } from "@/components/assistant-app";

export const dynamic = "force-dynamic";
export const metadata = { title: "Scout · your trusted shortlist" };

export default function AssistantPage() {
  return <AssistantApp chatEnabled={Boolean(process.env.OPENROUTER_API_KEY)} />;
}
