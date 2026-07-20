import { ListingForm } from "@/components/dashboard/ListingForm";

type EditListingPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditListingPage({ params }: EditListingPageProps) {
  const { id } = await params;
  return <ListingForm id={id} />;
}
