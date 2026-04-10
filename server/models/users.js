import pool from '../db.js';

/**
 * Insert a new user
 * @param {string} username
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
 * Update a user's username
 * @param {number} user_id
 * @param {string} username
 * @return {Object} updated user row
 */
export async function updateUsernameById(user_id, username) {
    const result = await pool.query(
        `
        UPDATE Users
        SET username = $1
        WHERE id = $2
        RETURNING id, username
        `,
        [username, user_id]
    );

    return result.rows[0];
}

/**
 * Update a user's password
 * @param {number} user_id
 * @param {string} password_hash
 * @return {Object} updated user row
 */
export async function updatePasswordById(user_id, password_hash) {
    const result = await pool.query(
        `
        UPDATE Users
        SET password_hash = $1
        WHERE id = $2
        RETURNING id, username
        `,
        [password_hash, user_id]
    );

    return result.rows[0];
}
