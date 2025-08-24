import { useState } from "react";
import "./donationsModal.css";

interface CampaignsModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (campaign: any) => void;
}

export function CampaignsModal({ open, onClose, onSubmit }: CampaignsModalProps) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    amount: "",
    startDate: "",
    endDate: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    onSubmit(form);
    setLoading(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="donations-modal-overlay">
      <div className="donations-modal-content">
        <div className="donations-modal-header">
          <h2>Create Campaign</h2>
          <button className="donations-modal-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="donations-modal-body">
          <form className="donations-form" onSubmit={handleSubmit}>
            <div className="form-row">
                <div className="form-group">
                <label htmlFor="name">Campaign Name</label>
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
                <label htmlFor="startDate">Start Date</label>
                <input
                    type="date"
                    name="startDate"
                    id="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    required
                />
                </div>
                <div className="form-group">
                <label htmlFor="endDate">End Date</label>
                <input
                    type="date"
                    name="endDate"
                    id="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    required
                />
                </div>
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                name="description"
                id="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                required
              />
            </div>
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="cancel-button"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="submit-button"
                disabled={loading}
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