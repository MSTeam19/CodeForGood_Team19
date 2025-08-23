const express = require('express');
const { supabase } = require('../db/supabase');
const donationsModel = require('../model/donations');
const router = express.Router();

// POST /donations - Create new donation
router.post('/', async (req, res) => {
  try {
    const {
      regionId,
      donorName,
      donorEmail,
      amountCents,
      message,
      campaignId
    } = req.body;

    // Validate required fields
    if (!regionId || !donorName || !amountCents) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['regionId', 'donorName', 'amountCents']
      });
    }

    // Validate amount is positive
    if (amountCents <= 0) {
      return res.status(400).json({
        error: 'Amount must be greater than 0'
      });
    }

    // Insert the donation
    const { data, error } = await supabase
      .from('donations')
      .insert([{
        region_id: regionId,
        donor_name: donorName,
        donor_email: donorEmail,
        amount_cents: amountCents,
        donor_message: message,
        campaign_id: campaignId || 'demo-campaign',
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) {
      console.error('Donation creation error:', error);
      return res.status(500).json({
        error: 'Failed to create donation',
        details: error.message
      });
    }

    // Refresh the materialized view after new donation
    const { error: refreshError } = await supabase
      .rpc('refresh_leaderboard_region');

    if (refreshError) {
      console.warn('Warning: Failed to refresh leaderboard view:', refreshError);
    }

    // Transform response to match frontend expectations
    const donation = data[0];
    const response = {
      donationId: donation.id,
      regionId: donation.region_id,
      donorName: donation.donor_name,
      donorEmail: donation.donor_email,
      amountCents: donation.amount_cents,
      message: donation.message,
      campaignId: donation.campaign_id,
      createdAt: donation.created_at
    };

    res.status(201).json(response);

  } catch (error) {
    console.error('Donation endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// PATCH /donations/:id - Update donation
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      regionId,
      donorName,
      donorEmail,
      amountCents,
      message,
      campaignId
    } = req.body;

    // Build update object with only provided fields
    const updateData = {};
    if (regionId !== undefined) updateData.region_id = regionId;
    if (donorName !== undefined) updateData.donor_name = donorName;
    if (donorEmail !== undefined) updateData.donor_email = donorEmail;
    if (amountCents !== undefined) updateData.amount_cents = amountCents;
    if (message !== undefined) updateData.message = message;
    if (campaignId !== undefined) updateData.campaign_id = campaignId;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: 'No fields to update provided'
      });
    }

    // Validate amount if being updated
    if (updateData.amount_cents !== undefined && updateData.amount_cents <= 0) {
      return res.status(400).json({
        error: 'Amount must be greater than 0'
      });
    }

    const { data, error } = await supabase
      .from('donations')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Donation update error:', error);
      return res.status(500).json({
        error: 'Failed to update donation',
        details: error.message
      });
    }

    if (data.length === 0) {
      return res.status(404).json({
        error: 'Donation not found'
      });
    }

    // Refresh the materialized view after update
    const { error: refreshError } = await supabase
      .rpc('refresh_leaderboard_region');

    if (refreshError) {
      console.warn('Warning: Failed to refresh leaderboard view:', refreshError);
    }

    const donation = data[0];
    const response = {
      donationId: donation.id,
      regionId: donation.region_id,
      donorName: donation.donor_name,
      donorEmail: donation.donor_email,
      amountCents: donation.amount_cents,
      message: donation.message,
      campaignId: donation.campaign_id,
      createdAt: donation.created_at
    };

    res.json(response);

  } catch (error) {
    console.error('Donation update endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// DELETE /donations/:id - Delete donation
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('donations')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      console.error('Donation deletion error:', error);
      return res.status(500).json({
        error: 'Failed to delete donation',
        details: error.message
      });
    }

    if (data.length === 0) {
      return res.status(404).json({
        error: 'Donation not found'
      });
    }

    // Refresh the materialized view after deletion
    const { error: refreshError } = await supabase
      .rpc('refresh_leaderboard_region');

    if (refreshError) {
      console.warn('Warning: Failed to refresh leaderboard view:', refreshError);
    }

    res.json({
      message: 'Donation deleted successfully',
      donationId: id
    });

  } catch (error) {
    console.error('Donation deletion endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const data = await donationsModel.getAllDonationsWithMapping();

    if (!data) {
      return res.status(404).json({
        error: 'No donations found'
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Donation retrieval endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;