
import React from 'react';
import { NeonCard } from './NeonCard';

interface PinModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    pin: string;
    setPin: (pin: string) => void;
    error: string;
}

export const PinModal: React.FC<PinModalProps> = ({ isOpen, onClose, onSubmit, pin, setPin, error }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <NeonCard className="pin-modal-card">
                    <button
                        onClick={onClose}
                        className="card-close-btn"
                        aria-label="Tutup"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <form onSubmit={onSubmit}>
                        <div className="pin-input-group">
                            <label htmlFor="pin-input">Masukin PIN Pro Max</label>
                            <input
                                id="pin-input"
                                type="password"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                className="pin-input"
                                autoFocus
                            />
                            <p className="pin-error">{error || ' '}</p>
                        </div>
                        <button type="submit" className="btn btn--primary btn--full">
                            Save
                        </button>
                    </form>
                </NeonCard>
            </div>
        </div>
    );
};
