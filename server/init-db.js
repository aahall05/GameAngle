import pool from './db.js';

async function initDB() {
  try {
    console.log('⏳ Creating tables...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS Users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS Collages (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        creator_user_id INTEGER REFERENCES Users(id) ON DELETE SET NULL,
        created_at DATE DEFAULT CURRENT_DATE
      );

      ALTER TABLE Collages
      ADD COLUMN IF NOT EXISTS creator_user_id INTEGER REFERENCES Users(id) ON DELETE SET NULL;

        CREATE TABLE IF NOT EXISTS Videos (
        id SERIAL PRIMARY KEY,
        collage_id INTEGER REFERENCES Collages(id) ON DELETE CASCADE,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        path TEXT NOT NULL,
        length_seconds INTEGER,
        size BIGINT,
        created_at DATE DEFAULT CURRENT_DATE,
        time TIME DEFAULT CURRENT_TIME
      );

<<<<<<< HEAD
      CREATE TABLE IF NOT EXISTS Users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS TeamMembers (
        id SERIAL PRIMARY KEY,
        team_id INTEGER REFERENCES Teams(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES Users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS Thumbnails (
        id SERIAL PRIMARY KEY,
        video_id INTEGER REFERENCES Videos(id) ON DELETE CASCADE,
        path TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_collages_team_id
        ON Collages(team_id);

=======
>>>>>>> ebbd5cba6a33e1a7b5fc960de643608bad63fe9b
      CREATE INDEX IF NOT EXISTS idx_videos_collage_id
        ON Videos(collage_id);

      CREATE INDEX IF NOT EXISTS idx_collages_creator_user_id
        ON Collages(creator_user_id);
    `);

    console.log('✅ Tables created successfully');
  } catch (err) {
    console.error('❌ Error creating tables:', err);
  } finally {
    await pool.end();
  }
}

initDB();