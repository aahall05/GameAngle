import pool from '../db.js';

/**
 * Insert a new collage
 * @param {string} name
 * @param {number | null} creator_user_id
 * @param {string} created_at (optional, defaults to current date)
 * @return {Object} the inserted collage's row
 */
export async function createCollage({ name, creator_user_id = null, created_at = null }) {
    const result = await pool.query(`
    INSERT INTO Collages (name, creator_user_id, created_at)
    VALUES ($1, $2, COALESCE($3, CURRENT_DATE))
        RETURNING id
        `,
    [name, creator_user_id, created_at]
    )
    return result.rows[0]; // return the new collage's row
}



/**
 * Fetch a collage by its id
 * @param {number} collage_id
 * @return {Object} the collage row with the given id
 */
export async function getCollageById(collage_id) {
    const result = await pool.query(
        `SELECT * FROM Collages WHERE id = $1`,
        [collage_id]
    );
    return result.rows[0]; // return the collage with the given id
}

/**
 * Search collages by name
 * @param {string} search
 * @returns {Array} list of matching collage rows
 */
export async function searchCollages(search = '') {
  const searchTerm = `%${search.trim()}%`;
  const result = await pool.query(
    `
    SELECT
      c.id,
      c.name,
      c.created_at
    FROM Collages c
    WHERE c.name ILIKE $1
    ORDER BY c.created_at DESC, c.id DESC
    LIMIT 100
    `,
    [searchTerm]
  );

  return result.rows;
}

/**
 * Fetch the most recent collages created by a user
 * @param {number} user_id
 * @param {number} limit
 * @returns {Array} list of collage rows
 */
export async function getRecentCollagesByCreator(user_id, limit = 5) {
  const result = await pool.query(
    `
    SELECT id, name, created_at
    FROM Collages
    WHERE creator_user_id = $1
    ORDER BY created_at DESC, id DESC
    LIMIT $2
    `,
    [user_id, limit]
  );

  return result.rows;
}