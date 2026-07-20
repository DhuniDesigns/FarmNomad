import { PublicHeader } from "@/components/layout/PublicHeader";
import { ProducerProfileExperience } from "@/components/market/ProducerProfileExperience";

type ProducerPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProducerPage({ params }: ProducerPageProps) {
  const { id } = await params;

  return (
    <>
      <PublicHeader />
      <ProducerProfileExperience id={id} />
    </>
  );
}
