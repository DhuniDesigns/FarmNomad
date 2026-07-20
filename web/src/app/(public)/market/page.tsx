import { PublicHeader } from "@/components/layout/PublicHeader";
import { MarketExperience } from "@/components/market/MarketExperience";

export const revalidate = 300;

export default function MarketPage() {
  return (
    <>
      <PublicHeader />
      <MarketExperience />
    </>
  );
}
