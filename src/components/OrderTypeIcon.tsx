"use client";

import {
  Utensils,
  ShoppingBag,
  Bike,
  type LucideIcon,
} from "lucide-react";
import type { OrderType } from "@/lib/order-type";

const ICON_MAP: Record<OrderType, LucideIcon> = {
  dine_in: Utensils,
  takeaway: ShoppingBag,
  delivery: Bike,
};

type Props = {
  type: OrderType;
  size?: number;
  strokeWidth?: number;
  className?: string;
};

export default function OrderTypeIcon({
  type,
  size = 14,
  strokeWidth = 2.2,
  className,
}: Props) {
  const Icon = ICON_MAP[type];
  return <Icon size={size} strokeWidth={strokeWidth} className={className} />;
}