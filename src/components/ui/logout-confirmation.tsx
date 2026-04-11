"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface LogoutConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function LogoutConfirmation({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: LogoutConfirmationProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Xác nhận đăng xuất</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Đang đăng xuất..." : "Đăng xuất"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
