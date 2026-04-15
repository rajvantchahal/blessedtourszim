import type { Role } from "./roles.js";

export type ObjectIdString = string;

export type GeoPoint = {
  type: "Point";
  coordinates: [lng: number, lat: number];
};

export type User = {
  _id: ObjectIdString;
  email: string;
  roles: Role[];
  vendorVerified?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type VendorApplicationType = "HOTEL" | "ACTIVITY";
export type VendorApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

export type VendorApplication = {
  _id: ObjectIdString;
  userId: ObjectIdString;
  type: VendorApplicationType;
  status: VendorApplicationStatus;
  documents: {
    name: string;
    url: string;
  }[];
  notes?: string;
  decidedByUserId?: ObjectIdString;
  decidedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type Hotel = {
  _id: ObjectIdString;
  ownerUserId: ObjectIdString;
  name: string;
  locationName: string;
  location: GeoPoint;
  verified: boolean;
  rooms: {
    type: string;
    total: number;
    booked: number;
    basePrice: number;
  }[];
  tags: string[];
  ratingAvg?: number;
  createdAt: string;
  updatedAt: string;
};

export type Activity = {
  _id: ObjectIdString;
  ownerUserId: ObjectIdString;
  name: string;
  locationName: string;
  location: GeoPoint;
  verified: boolean;
  slotTimes: string[];
  capacity: number;
  booked: number;
  price: number;
  tags: string[];
  ratingAvg?: number;
  createdAt: string;
  updatedAt: string;
};

export type BookingType = "HOTEL" | "ACTIVITY" | "BUNDLE";

export type Booking = {
  _id: ObjectIdString;
  userId: ObjectIdString;
  type: BookingType;
  hotelId?: ObjectIdString;
  activityIds?: ObjectIdString[];
  totalAmount: number;
  currency: "INR";
  split: {
    hotelAmount: number;
    activityAmount: number;
    platformAmount: number;
  };
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
};
