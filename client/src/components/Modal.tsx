import React, { FC } from "react";

const Modal: FC<{ onClose: () => void }> = ({ onClose, children }) => (
  <div
    className="modal"
    onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}
  >
    <div className="modal-body">
      <button type="button" className="close unstyled" onClick={onClose}>
        <i className="fas fa-times" />
      </button>
      <div className="content">{children}</div>
    </div>
  </div>
);

export default Modal;
