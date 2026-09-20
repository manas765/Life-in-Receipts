import receipts from "../data/receipts.json";
import chapters from "../data/chapters.json";
import Experience from "../components/Experience";

export default function Page() {
  return <Experience receipts={receipts} chapters={chapters} />;
}
