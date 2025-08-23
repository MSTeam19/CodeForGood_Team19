const express = require('express');
const { supabase } = require('../db/supabase');
const router = express.Router();

// POST /regions - Create new region
router.post('/', async (req, res) => {
  try {
    const {
      name,
      country,
      goalCents,
      lat,
      lng,
      description,
      campaignId
    } = req.body;

    // Validate required fields
    if (!name || !country || !goalCents) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['name', 'country', 'goalCents']
      });
    }

    // Validate coordinates if provided
    if ((lat && !lng) || (!lat && lng)) {
      return res.status(400).json({
        error: 'Both lat and lng must be provided together'
      });
    }

    if (lat && (lat < -90 || lat > 90)) {
      return res.status(400).json({
        error: 'Latitude must be between -90 and 90'
      });
    }

    if (lng && (lng < -180 || lng > 180)) {
      return res.status(400).json({
        error: 'Longitude must be between -180 and 180'
      });
    }

    const { data, error } = await supabase
      .from('regions')
      .insert([{
        name,
        country,
        goal_cents: goalCents,
        lat,
        lng,
        description,
        campaign_id: campaignId || 'demo-campaign',
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) {
      console.error('Region creation error:', error);
      return res.status(500).json({
        error: 'Failed to create region',
        details: error.message
      });
    }

    // Refresh the materialized view after new region
    const { error: refreshError } = await supabase
      .rpc('refresh_leaderboard_region');

    if (refreshError) {
      console.warn('Warning: Failed to refresh leaderboard view:', refreshError);
    }

    const region = data[0];
    const response = {
      regionId: region.id,
      name: region.name,
      country: region.country,
      goalCents: region.goal_cents,
      lat: region.lat,
      lng: region.lng,
      description: region.description,
      campaignId: region.campaign_id,
      createdAt: region.created_at
    };

    res.status(201).json(response);

  } catch (error) {
    console.error('Region endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// PATCH /regions/:id - Update region
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      country,
      goalCents,
      lat,
      lng,
      description,
      campaignId
    } = req.body;

    // Build update object with only provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (country !== undefined) updateData.country = country;
    if (goalCents !== undefined) updateData.goal_cents = goalCents;
    if (lat !== undefined) updateData.lat = lat;
    if (lng !== undefined) updateData.lng = lng;
    if (description !== undefined) updateData.description = description;
    if (campaignId !== undefined) updateData.campaign_id = campaignId;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: 'No fields to update provided'
      });
    }

    // Validate coordinates if being updated
    if (updateData.lat !== undefined && (updateData.lat < -90 || updateData.lat > 90)) {
      return res.status(400).json({
        error: 'Latitude must be between -90 and 90'
      });
    }

    if (updateData.lng !== undefined && (updateData.lng < -180 || updateData.lng > 180)) {
      return res.status(400).json({
        error: 'Longitude must be between -180 and 180'
      });
    }

    const { data, error } = await supabase
      .from('regions')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Region update error:', error);
      return res.status(500).json({
        error: 'Failed to update region',
        details: error.message
      });
    }

    if (data.length === 0) {
      return res.status(404).json({
        error: 'Region not found'
      });
    }

    const region = data[0];
    const response = {
      regionId: region.id,
      name: region.name,
      country: region.country,
      goalCents: region.goal_cents,
      lat: region.lat,
      lng: region.lng,
      description: region.description,
      campaignId: region.campaign_id,
      createdAt: region.created_at
    };

    res.json(response);

  } catch (error) {
    console.error('Region update endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// DELETE /regions/:id - Delete region
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('regions')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      console.error('Region deletion error:', error);
      return res.status(500).json({
        error: 'Failed to delete region',
        details: error.message
      });
    }

    if (data.length === 0) {
      return res.status(404).json({
        error: 'Region not found'
      });
    }

    res.json({
      message: 'Region deleted successfully',
      regionId: id
    });

  } catch (error) {
    console.error('Region deletion endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /regions - Get all regions
router.get('/', async (req, res) => {
  try {
    const { country, campaignId } = req.query;

    // Build query for regions
    let query = supabase
      .from('regions')
      .select('*')
      .order('name');

    // Filter by country if provided
    if (country && country !== 'ALL') {
      query = query.eq('country', country);
    }

    // Filter by campaign if needed (for future campaign-specific regions)
    if (campaignId && campaignId !== 'demo-campaign') {
      query = query.eq('campaign_id', campaignId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Regions query error:', error);
      return res.status(500).json({
        error: 'Failed to fetch regions',
        details: error.message
      });
    }

    // Transform data to match frontend expectations
    const response = {
      regions: data.map(region => ({
        regionId: region.id,
        name: region.name,
        country: region.country,
        goalCents: region.goal_cents,
        lat: region.lat,
        lng: region.lng,
        description: region.description,
        createdAt: region.created_at
      }))
    };

    res.json(response);

  } catch (error) {
    console.error('Regions endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;