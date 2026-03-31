import pool from '../db.js';

/**
 * Insert a new thumbnail
 * @param {number} video_id
 * @param {string} path
 * @return {Object} the inserted thumbnail's row
 */

export async function insertThumbnail(video_id, path) {
  const result = await pool.query(
    'INSERT INTO Thumbnails (video_id, path) VALUES ($1, $2) RETURNING *',
    [video_id, path]
  );
  return result.rows[0];
}

/**
 * Fetch the thumbnail for a given video
 * @param {number} video_id
 * @return {Object} the thumbnail's row
 */
export async function getThumbnail(video_id) {
  const result = await pool.query(
    'SELECT * FROM Thumbnails WHERE video_id = $1',
    [video_id]
  );
  return result.rows[0];
}