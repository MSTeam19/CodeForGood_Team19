import { useState } from "react";
import "./donationsModal.css";

interface RegionsModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (region: any) => void;
}

export function RegionsModal({ open, onClose, onSubmit }: RegionsModalProps) {
  const [form, setForm] = useState({
    name: "",
    region_id: "",
    country: "",
    amount: "",
    lat: "",
    lng: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="donations-modal-overlay">
      <div className="donations-modal-content">
        <div className="donations-modal-header">
          <h2>Create Region</h2>
          <button className="donations-modal-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="donations-modal-body">
            <form className="donations-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                    <label htmlFor="name">School Name</label>
                    <input
                    type="text"
                    name="name"
                    id="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="region_id">Region ID</label>
                    <input
                    type="text"
                    name="region_id"
                    id="region_id"
                    value={form.region_id}
                    onChange={handleChange}
                    required
                    />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                    <label htmlFor="country">Country Code</label>
                    <input
                    type="text"
                    name="country"
                    id="country"
                    value={form.country}
                    onChange={handleChange}
                    required
                    maxLength={3}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="amount">Goal ($)</label>
                    <input
                    type="number"
                    name="amount"
                    id="amount"
                    value={form.amount}
                    onChange={handleChange}
                    required
                    min={1}
                    />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                    <label htmlFor="lat">Latitude</label>
                    <input
                    type="number"
                    name="lat"
                    id="lat"
                    value={form.lat}
                    onChange={handleChange}
                    required
                    step="any"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="lng">Longitude</label>
                    <input
                    type="number"
                    name="lng"
                    id="lng"
                    value={form.lng}
                    onChange={handleChange}
                    required
                    step="any"
                    />
                </div>
              </div>
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-button"
                >
                  Submit
                </button>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
}