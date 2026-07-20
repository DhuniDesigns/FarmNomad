import type { UserRole } from "@/types/auth";

export type DemoUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organisationStatus?: "PENDING" | "VERIFIED" | "REJECTED";
  location: string;
  phone: string;
};

export type Vendor = {
  id: string;
  userId: string;
  name: string;
  type: "FARMER" | "KITCHEN";
  region: string;
  postcode: string;
  bio: string;
  rating: number;
  fulfilment: string[];
};

export type ListingCategory = "Vegetables" | "Fruit" | "Dairy" | "Bakery" | "Prepared food" | "Herbs";
export type ListingStatus = "DRAFT" | "ACTIVE" | "SOLD_OUT" | "EXPIRED" | "ARCHIVED";

export type Listing = {
  id: string;
  vendorId: string;
  title: string;
  category: ListingCategory;
  description: string;
  pricePence: number;
  quantity: number;
  unit: "kg" | "box" | "crate" | "tray" | "case" | "bundle";
  region: string;
  postcode: string;
  distanceMiles: number;
  surplus: boolean;
  organic: boolean;
  status: ListingStatus;
  harvestDate: string;
  bestBefore: string;
  handling: string;
  collectionWindow: string;
  colour: string;
  imageLabel: string;
  imageUrl: string;
  imageAlt: string;
  createdAt: string;
  views: number;
};

export type OrderStatus = "PENDING" | "ACCEPTED" | "READY" | "COMPLETED" | "CANCELLED";

export type Order = {
  id: string;
  listingId: string;
  vendorId: string;
  buyerName: string;
  buyerType: "Kitchen" | "Organisation";
  quantity: number;
  status: OrderStatus;
  note: string;
  createdAt: string;
};

export type Enquiry = {
  id: string;
  listingId: string;
  name: string;
  email: string;
  quantity: number;
  note: string;
  createdAt: string;
};

export type DemoState = {
  users: DemoUser[];
  vendors: Vendor[];
  listings: Listing[];
  orders: Order[];
  enquiries: Enquiry[];
  sessionUserId: string;
  favourites: string[];
  toast?: string;
};

export type ListingInput = Omit<Listing, "id" | "vendorId" | "createdAt" | "views">;
