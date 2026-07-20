import { OrderDetail } from "@/components/orders/OrderDetail";

type OrderPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;
  return <OrderDetail id={id} />;
}
