"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useState } from "react";

type ReservationWithDetails =
  (typeof api.reservations.getAll._returnType)[number];

export const ReservationCard = ({
  reservation,
}: {
  reservation: ReservationWithDetails;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const cancelReservation = useMutation(api.reservations.cancelReservation);

  const handleCancel = async () => {
    try {
      await cancelReservation({ reservationId: reservation._id });
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to cancel reservation", error);
      setIsOpen(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-md shadow-sm border">
      <p className="font-bold text-lg mb-2">{reservation.customerName}</p>
      <p className="text-sm text-gray-500 mb-2">
        予約番号: {reservation.reservationNumber}
      </p>
      <p className="text-sm text-gray-700">
        <span className="font-semibold">サービス:</span>{" "}
        {reservation.serviceName}
      </p>
      <p className="text-sm text-gray-700">
        <span className="font-semibold">日時:</span>{" "}
        {format(new Date(reservation.dateTime), "yyyy/MM/dd HH:mm")}
      </p>
      <p className="text-sm text-gray-700">
        <span className="font-semibold">担当:</span> {reservation.staffName}
      </p>
      {reservation.status === "reserved" && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="mt-4">
              キャンセル
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>本当にキャンセルしますか？</DialogTitle>
              <DialogDescription>
                この操作は元に戻せません。この予約をキャンセルします。
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">キャンセル</Button>
              </DialogClose>
              <Button onClick={handleCancel}>続ける</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
