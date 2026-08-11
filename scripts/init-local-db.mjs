import { createClient } from '@libsql/client';

const client = createClient({
  url: 'file:./local.db',
  authToken: '',
});

const statements = [
  `CREATE TABLE IF NOT EXISTS "users" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "created_at" TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "departments" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "issues" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "image_url" TEXT,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "address" TEXT,
    "status" TEXT NOT NULL DEFAULT 'received',
    "department_id" INTEGER,
    "assigned_by" INTEGER,
    "admin_notes" TEXT,
    "vote_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL,
    FOREIGN KEY("user_id") REFERENCES "users"("id"),
    FOREIGN KEY("department_id") REFERENCES "departments"("id"),
    FOREIGN KEY("assigned_by") REFERENCES "users"("id")
  )`,
  `CREATE TABLE IF NOT EXISTS "votes" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "issue_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TEXT NOT NULL,
    FOREIGN KEY("issue_id") REFERENCES "issues"("id"),
    FOREIGN KEY("user_id") REFERENCES "users"("id")
  )`,
  `CREATE TABLE IF NOT EXISTS "notifications" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "issue_id" INTEGER,
    "message" TEXT NOT NULL,
    "type" TEXT,
    "is_read" INTEGER NOT NULL DEFAULT 0,
    "created_at" TEXT NOT NULL,
    FOREIGN KEY("user_id") REFERENCES "users"("id"),
    FOREIGN KEY("issue_id") REFERENCES "issues"("id")
  )`,
  `CREATE TABLE IF NOT EXISTS "user" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "email_verified" INTEGER NOT NULL DEFAULT 0,
    "image" TEXT,
    "created_at" INTEGER NOT NULL,
    "updated_at" INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "session" (
    "id" TEXT PRIMARY KEY,
    "expires_at" INTEGER NOT NULL,
    "token" TEXT NOT NULL UNIQUE,
    "created_at" INTEGER NOT NULL,
    "updated_at" INTEGER NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "user_id" TEXT NOT NULL,
    FOREIGN KEY("user_id") REFERENCES "user"("id") ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "account" (
    "id" TEXT PRIMARY KEY,
    "account_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "id_token" TEXT,
    "access_token_expires_at" INTEGER,
    "refresh_token_expires_at" INTEGER,
    "scope" TEXT,
    "password" TEXT,
    "created_at" INTEGER NOT NULL,
    "updated_at" INTEGER NOT NULL,
    FOREIGN KEY("user_id") REFERENCES "user"("id") ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "verification" (
    "id" TEXT PRIMARY KEY,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" INTEGER NOT NULL,
    "created_at" INTEGER,
    "updated_at" INTEGER
  )`
];

for (const sql of statements) {
  await client.execute(sql);
}

const departmentRows = [
  ['Roads & Traffic', 'Potholes, roadworks, and traffic safety issues'],
  ['Water & Sanitation', 'Water supply, drainage, and sanitation complaints'],
  ['Street Lighting', 'Broken lights and unsafe public lighting concerns'],
  ['Waste Management', 'Garbage collection and waste disposal issues'],
  ['Public Safety', 'Safety concerns and municipal incident reporting'],
];

const existingDepartments = await client.execute('SELECT COUNT(*) AS count FROM departments');
if ((existingDepartments.rows?.[0]?.count ?? 0) === 0) {
  for (const [name, description] of departmentRows) {
    await client.execute({
      sql: 'INSERT INTO departments (name, description, created_at) VALUES (?, ?, ?)',
      args: [name, description, new Date().toISOString()],
    });
  }
}

const issueCount = await client.execute('SELECT COUNT(*) AS count FROM issues');
if ((issueCount.rows?.[0]?.count ?? 0) > 0) {
  await client.execute('DELETE FROM notifications');
  await client.execute('DELETE FROM votes');
  await client.execute('DELETE FROM issues');
  await client.execute("DELETE FROM sqlite_sequence WHERE name = 'issues'");
}

const sampleIssues = [
  ['Pothole on Main Street', 'Large pothole causing traffic issues near the bus stop.', 'Roads & Traffic', 12.9716, 77.5946, 'Main Street, Bengaluru', 'resolved'],
  ['Broken street light', 'Street light is out near the community park.', 'Street Lighting', 12.9725, 77.5958, 'Park Road, Bengaluru', 'resolved'],
  ['Garbage overflow', 'Waste bins are overflowing near the market area.', 'Waste Management', 12.9698, 77.5923, 'Market Lane, Bengaluru', 'resolved'],
  ['Water leakage', 'Pipeline leak causing water stagnation on the road.', 'Water & Sanitation', 12.9734, 77.5981, 'Lake View Road, Bengaluru', 'resolved'],
  ['Drain blockage', 'Drain is blocked and overflowing after rainfall.', 'Water & Sanitation', 12.9707, 77.5938, 'River Road, Bengaluru', 'resolved'],
  ['Buried manhole cover', 'Manhole cover is sunk and a road hazard.', 'Roads & Traffic', 12.9742, 77.5972, 'Old Town Road, Bengaluru', 'resolved'],
  ['Open garbage dump', 'Garbage is dumped near residential apartments.', 'Waste Management', 12.9678, 77.5915, 'Apartment Zone, Bengaluru', 'resolved'],
  ['Broken CCTV pole', 'Public safety camera pole has fallen in the lane.', 'Public Safety', 12.9756, 77.6004, 'Safety Lane, Bengaluru', 'resolved'],
  ['Water supply interruption', 'Residents have no water supply for the last 12 hours.', 'Water & Sanitation', 12.9662, 77.5989, 'Heritage Avenue, Bengaluru', 'resolved'],
  ['Streetlight outage', 'Dark stretch near the school entrance is unsafe.', 'Street Lighting', 12.9751, 77.5941, 'School Road, Bengaluru', 'resolved'],
  ['Power line issue', 'Exposed cable near residential street needs attention.', 'Public Safety', 12.9739, 77.6012, 'Electric Avenue, Bengaluru', 'resolved'],
  ['Traffic signal failure', 'Signal not working near the junction.', 'Roads & Traffic', 12.9749, 77.5929, 'Signal Junction, Bengaluru', 'resolved'],
  ['Bus stop bench damage', 'Bench at bus stand is broken and unsafe.', 'Public Safety', 12.9702, 77.5964, 'Bus Stand, Bengaluru', 'resolved'],
  ['Overflowing drainage', 'Stagnant water after rain is spreading in the lane.', 'Water & Sanitation', 12.9694, 77.6018, 'Woodland Road, Bengaluru', 'resolved'],
  ['Street cleanup needed', 'Accumulated trash on pavement after festival.', 'Waste Management', 12.9759, 77.5961, 'Festival Road, Bengaluru', 'resolved'],
  ['Cracked road', 'Cracks on the main lane need surfacing work.', 'Roads & Traffic', 12.9721, 77.5993, 'Market Main Road, Bengaluru', 'resolved'],
  ['Broken traffic sign', 'Direction sign missing near the intersection.', 'Roads & Traffic', 12.9681, 77.5949, 'Intersection Road, Bengaluru', 'resolved'],
  ['Fallen tree branch', 'Tree branch obstructing the public walkway.', 'Public Safety', 12.9731, 77.5931, 'Garden Road, Bengaluru', 'resolved'],
  ['Streetlight flicker', 'Several poles flicker intermittently after dusk.', 'Street Lighting', 12.9719, 77.5902, 'Sunset Road, Bengaluru', 'resolved'],
  ['Damaged sidewalk', 'Broken sidewalk creates risk for pedestrians.', 'Roads & Traffic', 12.9684, 77.5997, 'Civic Square, Bengaluru', 'resolved'],
  ['Unsafe pedestrian crossing', 'Traffic crossing marks are faded and unsafe.', 'Roads & Traffic', 12.9689, 77.5967, 'Cross Road, Bengaluru', 'in_progress'],
  ['Illegal dumping', 'Construction waste dumped beside public footpath.', 'Waste Management', 12.9712, 77.5908, 'Construction Road, Bengaluru', 'in_progress'],
  ['Blocked storm drain', 'Storm drain is clogged and flooding the nearby lane.', 'Water & Sanitation', 12.9668, 77.5976, 'North Lane, Bengaluru', 'in_progress'],
  ['Sewer overflow', 'Raw sewage is overflowing in a public lane.', 'Water & Sanitation', 12.9728, 77.5886, 'Central Lane, Bengaluru', 'received'],
  ['Public park fence damage', 'A damaged section of the public park fence needs repair.', 'Public Safety', 12.9692, 77.5951, 'Park Entrance, Bengaluru', 'in_progress']
];

const now = Date.now();
for (let i = 0; i < sampleIssues.length; i += 1) {
  const [title, description, category, latitude, longitude, address, status] = sampleIssues[i];
  await client.execute({
    sql: `INSERT INTO issues (
      user_id, title, description, category, image_url, latitude, longitude, address, status,
      department_id, assigned_by, admin_notes, vote_count, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      null,
      title,
      description,
      category,
      null,
      latitude,
      longitude,
      address,
      status,
      null,
      null,
      status === 'resolved' ? 'Issue resolved by the municipal team.' : null,
      i % 5 === 0 ? 12 + i : 4 + (i % 9),
      new Date(now - (sampleIssues.length - i) * 86400000).toISOString(),
      new Date(now - (sampleIssues.length - i) * 86400000).toISOString(),
    ],
  });
}

console.log('Local SQLite database initialized at ./local.db');
console.log('Seeded demo data includes 25 issues with 20 resolved entries.');
