import React from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";

interface DeletePackageModalProps {
  isOpen: boolean;
  packageTitle?: string;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

const DeletePackageModal: React.FC<DeletePackageModalProps> = ({
  isOpen,
  packageTitle,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Package">
      <div className="space-y-6">
        <p className="text-gray-600 leading-relaxed">
          Are you sure you want to delete "
          <span className="font-semibold text-gray-900">{packageTitle}</span>"?
          This action cannot be undone and will permanently remove the package
          and all associated data.
        </p>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={isDeleting}>
            Delete Package
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeletePackageModal;
