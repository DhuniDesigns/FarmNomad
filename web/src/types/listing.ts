export type ListingStatus = "ACTIVE" | "ARCHIVED" | "SOLD_OUT";

export type Listing = {
  id: string;
  title: string;
  description: string;
  category: string;
  pricePence: number;
  quantity: number;
  unit: string;
  location: string;
  vendorName: string;
  status: ListingStatus;
  surplus: boolean;
};

export type ListingPage = {
  content: Listing[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};
