const pool = require("../config/db");

const getAllScans = async () => {
  const result = await pool.query(`
    SELECT
      scans.id,
      scans.scan_type,
      scans.created_at,
      COUNT(violations.id) AS violation_count
    FROM scans
    LEFT JOIN violations ON scans.id = violations.scan_id
    GROUP BY scans.id
    ORDER BY scans.created_at DESC
  `);

  return result.rows;
};

module.exports = {
  getAllScans
};
