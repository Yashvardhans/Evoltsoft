const pool = require('../config/db');

const Station = {
  // Create a new charging station
  create: async (stationData, userId) => {
    const { name, latitude, longitude, status, power_output } = stationData;
    const query = `
      INSERT INTO charging_stations 
        (name, latitude, longitude, status, power_output, created_by) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *
    `;
    const values = [name, latitude, longitude, status, power_output, userId];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating station: ${error.message}`);
    }
  },

  // Get all charging stations
  getAll: async () => {
    try {
      const result = await pool.query(`
        SELECT 
          id, name, latitude, longitude, status, power_output, 
          to_char(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
        FROM charging_stations
      `);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching stations: ${error.message}`);
    }
  },

  // Get station by ID
  getById: async (id) => {
    try {
      const result = await pool.query('SELECT * FROM charging_stations WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching station: ${error.message}`);
    }
  },

  // Update a station
  update: async (id, stationData) => {
    const { name, latitude, longitude, status, power_output } = stationData;
    const query = `
      UPDATE charging_stations 
      SET 
        name = $1, 
        latitude = $2, 
        longitude = $3, 
        status = $4, 
        power_output = $5 
      WHERE id = $6 
      RETURNING *
    `;
    const values = [name, latitude, longitude, status, power_output, id];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating station: ${error.message}`);
    }
  },

  // Delete a station
  delete: async (id) => {
    try {
      await pool.query('DELETE FROM charging_stations WHERE id = $1', [id]);
      return true;
    } catch (error) {
      throw new Error(`Error deleting station: ${error.message}`);
    }
  },

  // Check if station exists
  exists: async (id) => {
    try {
      const result = await pool.query('SELECT 1 FROM charging_stations WHERE id = $1', [id]);
      return result.rowCount > 0;
    } catch (error) {
      throw new Error(`Error checking station existence: ${error.message}`);
    }
  }
};

module.exports = Station;