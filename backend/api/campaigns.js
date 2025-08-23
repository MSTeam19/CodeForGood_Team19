const express = require('express');
const { supabase } = require('../db/supabase');
const router = express.Router();

// POST /campaigns - Create new campaign
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      goalCents,
      startDate,
      endDate,
      isActive = true
    } = req.body;

    // Validate required fields
    if (!name || !description || !goalCents) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['name', 'description', 'goalCents']
      });
    }

    // Validate dates
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        error: 'Start date must be before end date'
      });
    }

    const { data, error } = await supabase
      .from('campaigns')
      .insert([{
        name,
        description,
        goal_cents: goalCents,
        start_date: startDate,
        end_date: endDate,
        is_active: isActive,
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) {
      console.error('Campaign creation error:', error);
      return res.status(500).json({
        error: 'Failed to create campaign',
        details: error.message
      });
    }

    const campaign = data[0];
    const response = {
      campaignId: campaign.id,
      name: campaign.name,
      description: campaign.description,
      goalCents: campaign.goal_cents,
      startDate: campaign.start_date,
      endDate: campaign.end_date,
      isActive: campaign.is_active,
      createdAt: campaign.created_at
    };

    res.status(201).json(response);

  } catch (error) {
    console.error('Campaign endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// PATCH /campaigns/:id - Update campaign
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      goalCents,
      startDate,
      endDate,
      isActive
    } = req.body;

    // Build update object with only provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (goalCents !== undefined) updateData.goal_cents = goalCents;
    if (startDate !== undefined) updateData.start_date = startDate;
    if (endDate !== undefined) updateData.end_date = endDate;
    if (isActive !== undefined) updateData.is_active = isActive;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: 'No fields to update provided'
      });
    }

    // Validate dates if both are being updated
    if (updateData.start_date && updateData.end_date && 
        new Date(updateData.start_date) >= new Date(updateData.end_date)) {
      return res.status(400).json({
        error: 'Start date must be before end date'
      });
    }

    const { data, error } = await supabase
      .from('campaigns')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Campaign update error:', error);
      return res.status(500).json({
        error: 'Failed to update campaign',
        details: error.message
      });
    }

    if (data.length === 0) {
      return res.status(404).json({
        error: 'Campaign not found'
      });
    }

    const campaign = data[0];
    const response = {
      campaignId: campaign.id,
      name: campaign.name,
      description: campaign.description,
      goalCents: campaign.goal_cents,
      startDate: campaign.start_date,
      endDate: campaign.end_date,
      isActive: campaign.is_active,
      createdAt: campaign.created_at
    };

    res.json(response);

  } catch (error) {
    console.error('Campaign update endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// DELETE /campaigns/:id - Delete campaign
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      console.error('Campaign deletion error:', error);
      return res.status(500).json({
        error: 'Failed to delete campaign',
        details: error.message
      });
    }

    if (data.length === 0) {
      return res.status(404).json({
        error: 'Campaign not found'
      });
    }

    res.json({
      message: 'Campaign deleted successfully',
      campaignId: id
    });

  } catch (error) {
    console.error('Campaign deletion endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /campaigns/:id/leaderboard - Get leaderboard data
router.get('/:id/leaderboard', async (req, res) => {
  try {
    const { id: campaignId } = req.params;
    const { country } = req.query;

    // Build query for leaderboard data
    let query = supabase
      .from('leaderboard_region')
      .select('*')
      .order('total_amount_cents', { ascending: false });

    // Filter by country if provided
    if (country && country !== 'ALL') {
      query = query.eq('country', country);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Leaderboard query error:', error);
      return res.status(500).json({
        error: 'Failed to fetch leaderboard data',
        details: error.message
      });
    }

    // Transform data to match frontend expectations
    const response = {
      country: country === 'ALL' ? undefined : country,
      regions: data.map(row => ({
        regionId: row.region_id, // This matches your materialized view
        name: row.name,
        totalAmountCents: parseInt(row.total_amount_cents) || 0,
        donationCount: parseInt(row.donation_count) || 0,
        highestSingleDonationCents: parseInt(row.highest_single_donation_cents) || 0,
        lat: parseFloat(row.lat),
        lng: parseFloat(row.lng),
        goalCents: parseInt(row.goal_cents) || 0,
        championCount: parseInt(row.champion_count) || 0,
        leadChampionName: row.lead_champion_name,
        leadChampionId: row.lead_champion_id
      })),
      updatedAt: new Date().toISOString()
    };

    res.json(response);

  } catch (error) {
    console.error('Leaderboard endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;