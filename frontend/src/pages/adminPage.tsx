import { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Typography, TablePagination,
  IconButton,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";

import "./adminPage.css"
import { Add, Campaign, Delete, LocationCity } from "@mui/icons-material";
import { DonationsModal } from "@/components/donationsModal/donationsModal";
import { CampaignsModal } from "@/components/donationsModal/campaignsModal";
import { RegionsModal } from "@/components/donationsModal/regionsModal";

type Donation = {
  id: number;
  campaign_id: string;
  region_id: string;
  donor_name: string;
  donor_email: string;
  amount: number;
  currency: string;
  payment_status: string;
  payment_method: string;
  transaction_id: string;
  donor_message: string;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
  region_name?: string;
  campaign_name?: string;
};

function AdminPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [campaignsModalOpen, setCampaignsModalOpen] = useState(false);
  const [regionsModalOpen, setRegionsModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  async function fetchDonations() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"}/donations`);
      if (!res.ok) throw new Error("Failed to fetch donations");
      const data = await res.json();

      const mapped = Array.isArray(data)
        ? data.map((donation: any) => ({
            ...donation,
            amount: donation.amount_cents / 100,
            region_name: donation.regions?.name || "",
            campaign_name: donation.campaigns?.name || "",
          }))
        : [];

      setDonations(mapped);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleChangePage = (_e: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteId == null) return;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"}/donations/${deleteId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete donation");
      setDonations((prev) => prev.filter((donation) => donation.id !== deleteId));
      setSnackbarMessage("Donation deleted successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err: any) {
      setSnackbarMessage(err.message);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };

  const handleDonationModalSubmit = async (donation: any) => {
    try {
      const { amount, ...rest } = donation;
      const payload = { ...rest, amountCents: amount * 100 };
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"}/donations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to add donation");
      setLoading(true);
      await res.json();
      fetchDonations();
      setLoading(false);
      setSnackbarMessage("Donation added successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err: any) {
      setSnackbarMessage(err.message);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleCampaignsModalSubmit = async (campaign: any) => {
    try {
      const { amount, ...rest } = campaign;
      const payload = { ...rest, goalCents: amount * 100 };
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"}/campaigns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to add campaign");
      setLoading(true);
      await res.json();
      fetchDonations();
      setLoading(false);
      setSnackbarMessage("Campaign added successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err: any) {
      setSnackbarMessage(err.message);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleRegionsModalSubmit = async (region: any) => {
    try {
      const { amount, ...rest } = region;
      const payload = { ...rest, goalCents: amount * 100 };
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"}/regions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to add region");
      setLoading(true);
      await res.json();
      fetchDonations();
      setLoading(false);
      setSnackbarMessage("Region added successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err: any) {
      console.log(err);
      setSnackbarMessage(err.message);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  return (
    <div className="main-box" style={{ background: "white", minHeight: "100vh", padding: "32px 0" }}>
      <div className="container-card">
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert severity={snackbarSeverity} onClose={() => setSnackbarOpen(false)} sx={{ width: "100%" }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
        <div className="header-section">
          <Typography variant="h4" className="section-title" gutterBottom>
            All Donations
          </Typography>
          <div className="header-actions">
            <Button
              style={{ color: "#00796b" }}
              startIcon={<Add />}
              onClick={() => setDonationModalOpen(true)}
            >
              Add Donation
            </Button>
            <Button
              style={{ color: "#00796b" }}
              startIcon={<Campaign />}
              onClick={() => setCampaignsModalOpen(true)}
            >
              Add Campaign
            </Button>
            <Button
              style={{ color: "#00796b" }}
              startIcon={<LocationCity />}
              onClick={() => setRegionsModalOpen(true)}
            >
              Add Region
            </Button>
          </div>
        </div>
        <DonationsModal
          open={donationModalOpen}
          onClose={() => setDonationModalOpen(false)}
          onSubmit={handleDonationModalSubmit}
        />
        <CampaignsModal
          open={campaignsModalOpen}
          onClose={() => setCampaignsModalOpen(false)}
          onSubmit={handleCampaignsModalSubmit}
        />
        <RegionsModal
          open={regionsModalOpen}
          onClose={() => setRegionsModalOpen(false)}
          onSubmit={handleRegionsModalSubmit}
        />
        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
        {loading ? (
          <div style={{ textAlign: "center", padding: "32px" }}>
            <CircularProgress />
          </div>
        ) : (
          <>
            <TableContainer component={Paper} sx={{ boxShadow: 0, borderRadius: 3 }}>
              <Table sx={{
                minWidth: 1000,
                "& th": { background: "#f8f9fa", fontWeight: 600, color: "#424242" },
                "& td": { color: "#424242" },
                "& tbody tr:nth-of-type(odd)": { background: "#f5f5f5" },
              }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Region</TableCell>
                    <TableCell>Donor Name</TableCell>
                    <TableCell>Donor Email</TableCell>
                    <TableCell>Anonymous?</TableCell>
                    <TableCell>Payment Status</TableCell>
                    <TableCell>Payment Method</TableCell>
                    <TableCell>Transaction ID</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Message</TableCell>
                    <TableCell>Campaign</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell>Last Updated At</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {donations
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((donation: any) => (
                      <TableRow key={donation.id}>
                        <TableCell>{donation.region_name}</TableCell>
                        <TableCell>{donation.donor_name}</TableCell>
                        <TableCell>{donation.donor_email || "-"}</TableCell>
                        <TableCell>{donation.is_anonymous ? "Yes" : "No"}</TableCell>
                        <TableCell>{donation.payment_status || "-"}</TableCell>
                        <TableCell>{donation.payment_method || "-"}</TableCell>
                        <TableCell>{donation.transaction_id || "-"}</TableCell>
                        <TableCell>
                          {donation.amount}
                          <span style={{ color: "#0288d1", fontWeight: 600, marginLeft: 4 }}>
                            {donation.currency}
                          </span>
                        </TableCell>
                        <TableCell>{donation.donor_message || "-"}</TableCell>
                        <TableCell>{donation.campaign_name}</TableCell>
                        <TableCell>{donation.created_at ? new Date(donation.created_at).toLocaleString() : "-"}</TableCell>
                        <TableCell>{donation.updated_at ? new Date(donation.updated_at).toLocaleString() : "-"}</TableCell>
                        <TableCell align="right">
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteClick(donation.id)}
                          aria-label="delete"
                          size="small"
                        >
                          <Delete />
                        </IconButton>
                    </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={donations.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[10, 25, 50]}
            />
          </>
        )}
        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            Are you sure you want to delete this donation?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmDelete} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}

export default AdminPage;
