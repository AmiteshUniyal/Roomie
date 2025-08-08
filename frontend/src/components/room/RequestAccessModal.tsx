"use client";

import { useState } from "react";
import roomService from "@/lib/services/roomService";

interface RequestAccessModalProps {
  roomId: string;
  roomName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RequestAccessModal({
  roomId,
  roomName,
  isOpen,
  onClose,
  onSuccess,
}: RequestAccessModalProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      console.log(
        "Requesting access to room:",
        roomId,
        "with message:",
        message
      );
      await roomService.requestRoomAccess(roomId, message || "I would like to join this room");
      console.log("Access request sent successfully");
      onSuccess();
      onClose();
      setMessage("");
    } catch (error) {
      console.error("Failed to request access:", error);
      alert("Failed to send request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Request Access
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          You&apos;re requesting access to <strong>{roomName}</strong>. Please
          provide a reason for your request.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Message (Optional)
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Why do you want to join this room?"
              rows={3}
              className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              {message.length}/200 characters
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Sending..." : "Send Request"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
