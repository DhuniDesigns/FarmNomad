import { PublicHeader } from "@/components/layout/PublicHeader";
import { ListingDetailExperience } from "@/components/market/ListingDetailExperience";

export const revalidate = 300;

type ListingDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const { id } = await params;
  return (
    <>
      <PublicHeader />
      <ListingDetailExperience id={id} />
    </>
  );
}
