import { sql } from "drizzle-orm";
import { db, pool } from "./index.js";

const expectedTables = [
  "users",
  "categories",
  "products",
  "suppliers",
  "customers",
  "purchases",
  "purchase_details",
  "sales",
  "sale_details",
  "consignations",
  "consignment_details",
  "inventory_movements",
  "audit_logs"
];

const result = await db.execute(sql`
  select table_name
  from information_schema.tables
  where table_schema = 'public'
    and table_name in (${sql.join(expectedTables.map((table) => sql`${table}`), sql`, `)})
  order by table_name
`);

console.table(result.rows);
await pool.end();
