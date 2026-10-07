import { pool } from "./index.js";
import { seedAdmin } from "./seedAdmin.js";

try {
  await seedAdmin();
} finally {
  await pool.end();
}
