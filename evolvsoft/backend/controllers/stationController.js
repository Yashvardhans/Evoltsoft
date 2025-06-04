const Station = require('../models/station');

// Create a new charging station
exports.createStation = async (req, res) => {
  try {
    // Validate required fields
    const { name, latitude, longitude, power_output } = req.body;
    if (!name || !latitude || !longitude || !power_output) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Set default status if not provided
    const status = req.body.status || 'Active';
    
    // Create station with user ID from auth token
    const station = await Station.create(
      { name, latitude, longitude, status, power_output },
      req.user.id
    );

    res.status(201).json({
      message: 'Station created successfully',
      station
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Get all charging stations
exports.getStations = async (req, res) => {
  try {
    const stations = await Station.getAll();
    res.json({
      count: stations.length,
      stations
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Update a station
exports.updateStation = async (req, res) => {
  try {
    const stationId = req.params.id;
    
    // Check if station exists
    const exists = await Station.exists(stationId);
    if (!exists) {
      return res.status(404).json({ error: 'Station not found' });
    }

    // Validate required fields
    const { name, latitude, longitude, status, power_output } = req.body;
    if (!name || !latitude || !longitude || !status || !power_output) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Update station
    const updatedStation = await Station.update(stationId, {
      name,
      latitude,
      longitude,
      status,
      power_output
    });

    res.json({
      message: 'Station updated successfully',
      station: updatedStation
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a station
exports.deleteStation = async (req, res) => {
  try {
    const stationId = req.params.id;
    
    // Check if station exists
    const exists = await Station.exists(stationId);
    if (!exists) {
      return res.status(404).json({ error: 'Station not found' });
    }

    // Delete station
    await Station.delete(stationId);
    
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};