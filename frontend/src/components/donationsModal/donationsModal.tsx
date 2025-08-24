import { useEffect, useState } from "react";
import "./donationsModal.css";

interface DonationsModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (donation: any) => void;
}

export function DonationsModal({ open, onClose, onSubmit }: DonationsModalProps) {
  const [regions, setRegions] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    regionId: "",
    donorName: "",
    donorEmail: "",
    amount: "",
    message: "",
    campaignId: "",
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [regionsRes, campaignsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"}/regions`),
          fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"}/campaigns`)
        ]);
        const regionsData = await regionsRes.json();
        const campaignsData = await campaignsRes.json();
        setRegions(regionsData.regions);
        setCampaigns(campaignsData);
      } catch (err) {
        console.error("Error fetching regions or campaigns:", err);
      } finally {
        setLoading(false);
      }
    }
    if (open) fetchData();
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
          <h2>Make a Donation</h2>
          <button className="donations-modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="donations-modal-body">
          {loading ? (
            <div style={{ textAlign: "center", padding: "24px" }}>
              <span>Loading...</span>
            </div>
          ) : (
            <form className="donations-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="regionId">Region</label>
                  <select
                    name="regionId"
                    id="regionId"
                    value={form.regionId}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>Select a region</option>
                    {regions.map((region: any) => (
                      <option key={region.regionId} value={region.regionId}>{region.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="campaignId">Campaign</label>
                  <select
                    name="campaignId"
                    id="campaignId"
                    value={form.campaignId}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>Select a campaign</option>
                    {campaigns.map((campaign: any) => (
                      <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="donorName">Donor Name</label>
                  <input
                    type="text"
                    name="donorName"
                    id="donorName"
                    value={form.donorName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="donorEmail">Donor Email</label>
                  <input
                    type="email"
                    name="donorEmail"
                    id="donorEmail"
                    value={form.donorEmail}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="amount">Amount (HKD)</label>
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
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  name="message"
                  id="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={2}
                />
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
                  disabled={loading}
                >
                  Submit
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}