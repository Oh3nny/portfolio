import HomePageClient from "@/components/HomePageClient";
import { getDesignPreviewItems } from "@/lib/designs";

export default async function Home() {
  const playPreviewItems = await getDesignPreviewItems();

  return <HomePageClient playPreviewItems={playPreviewItems} />;
}
