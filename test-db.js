// test-db.js
import 'dotenv/config'; // automatically loads .env
import pool from './server/db.js'; // import the pool
import { 
  createCollage, getCollageById 
} from './server/models/collages.js';
import { 
  createVideo, getVideosByCollage, getVideoById 
} from './server/models/videos.js';
import {
  createUser, getUserById, getUserByUsername
} from './server/models/users.js';

async function testDBFunctions() {
  try {
    console.log('⏳ Attempting to connect to the database...');
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully!');
    console.log('Current time in DB:', res.rows[0].now);


    // console.log('\n--- Testing Videos ---');
    // const newVideo = await createVideo({
    //   collage_id: newCollage.id,
    //   filename: 'video.mp4',
    //   original_name: 'myvideo.mp4',
    //   path: '/VideoFileStorage/video.mp4',
    //   length_seconds: 120,
    //   size: 10485760
    // });
    // console.log('Created video:', newVideo);

  

    // const fetchedVideo = await getVideoById(newVideo.id);
    // console.log('Fetched video by ID:', fetchedVideo);

    console.log('\n--- Testing Users ---');
    const newUser = await createUser({ username: `Coach`, password_hash: '12345' });
    console.log('Created user:', newUser);

    const fetchedUserById = await getUserById(newUser.id);
    console.log('Fetched user by ID:', fetchedUserById);

    const fetchedUserByUsername = await getUserByUsername(fetchedUserById.username);
    console.log('Fetched user by username:', fetchedUserByUsername);

    console.log('\n--- Testing Collages ---');
    const newCollage = await createCollage({ name: 'Test Collage' , creator_user_id: 1});
    console.log('Created collage:', newCollage);

    const videosForCollage = await getVideosByCollage(newCollage.id);
    console.log('Videos for collage:', videosForCollage);

    const fetchedCollage = await getCollageById(newCollage.id);
    console.log('Fetched collage by ID:', fetchedCollage);


  } catch (err) {
    console.error('❌ Error testing DB functions:', err);
  } finally {
    await pool.end();
    console.log('🔒 Connection closed');
  }
}

// Run the test
testDBFunctions();