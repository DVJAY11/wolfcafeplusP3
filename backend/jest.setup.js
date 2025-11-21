import path from 'path';
import os from 'os';

// Configure MongoMemoryServer binary caching to avoid repeated downloads
process.env.MONGOMS_DOWNLOAD_DIR = path.join(os.tmpdir(), 'mongo-binaries');
process.env.MONGOMS_VERSION = '6.0.9'; // Pin version to avoid re-downloads
process.env.MONGOMS_DOWNLOAD_MIRROR = 'https://fastdl.mongodb.org';
process.env.MONGOMS_DOWNLOAD_IGNORE_MISSING_HEADER = 'true';

// Set JWT secret for tests that require it
process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';
