import pool from '../db.js';

/**
 * Insert a new team
 * @param {string} name
 * @param {string} password_hash
 * @return {Object} the inserted user's row
 */
export async function createUser({ username, password_hash }) {
    const result = await pool.query(`
        INSERT INTO Users (username, password_hash)
        VALUES ($1, $2)
        RETURNING id
        `,
        [username, password_hash]
    )
    return result.rows[0]; // return the new user's row
}

/**
 * Fetch all teams a user is in
 * @param {number} userid
 * @return {Array} list of team rows
 */
export async function getTeamsByUser(userid) {
    const result = await pool.query(`
        SELECT * FROM TeamMembers WHERE userid = $1
        `,
        [userid]
    );
    return result.rows; // return list of teams' ids the user is in
}

/**
 * Fetch a user by its id
 * @param {number} user_id
 * @return {Object} the user row with the given id
 */
export async function getUserById(user_id) {
    const result = await pool.query(`
        SELECT * FROM Users WHERE id = $1
        `,
        [user_id]
    );
    return result.rows[0]; // return the user with the given id
}

/**
 * Fetch a user by its username
 * @param {string} username
 * @return {Object} the user row with the given username
 */
export async function getUserByUsername(username) {
    const result = await pool.query(`
        SELECT * FROM Users WHERE username = $1
        `,
        [username]
    );
    return result.rows[0]; // return the user with the given username
}

/**
 * Add a user to a team by user id and team id
 * @param {number} user_id
 * @param {number} team_id
 * @return {Object} the team member row with the given user_id and team_id
 */
export async function addUserToTeam(user_id, team_id) {
    const result = await pool.query(`
        INSERT INTO TeamMembers (user_id, team_id)
        VALUES ($1, $2)
        RETURNING *
        `,
        [user_id, team_id]
    );
    return result.rows[0]; // return the team member row with the given user_id and team_id
}

/**
 * Remove a user from a team by user id and team id
 * @param {number} user_id
 * @param {number} team_id
 * @return {Object} the team member row with the given user_id and team_id
 */
export async function removeUserFromTeam(user_id, team_id) {
    const result = await pool.query(`
        DELETE FROM TeamMembers WHERE user_id = $1 AND team_id = $2
        RETURNING *
        `,
        [user_id, team_id]
    );
    return result.rows[0]; // return the team member row with the given user_id and team_id
}