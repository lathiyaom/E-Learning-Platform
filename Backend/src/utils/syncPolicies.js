const fs = require("fs");
const path = require("path");
const { sequelize } = require("../Db/sequelize");

const syncRLSPolicies = async (mode = "full") => {
  try {
    console.log(`📂 Reading RLS and Policies from file (Mode: ${mode})...`);
    const sqlPath = path.join(__dirname, "../../supabase_rls_policies.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    // Remove multi-line comments (/* ... */)
    let cleanedSql = sql.replace(/\/\*[\s\S]*?\*\//g, "");

    // Remove single-line comments (-- ...)
    cleanedSql = cleanedSql
      .split("\n")
      .map((line) => line.split("--")[0])
      .join("\n");

    // Split by semicolon to execute one by one
    let statements = cleanedSql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    // If mode is 'drop', only keep DROP statements
    if (mode === "drop") {
      statements = statements.filter((s) =>
        s.toUpperCase().startsWith("DROP POLICY"),
      );
    }

    console.log(`🚀 Executing ${statements.length} policy statements...`);

    for (const statement of statements) {
      try {
        console.log(`📝 Executing: ${statement.substring(0, 50)}...`);
        await sequelize.query(statement);
      } catch (err) {
        if (err.message.toLocaleLowerCase().includes("already exists")) {
          console.log(`ℹ️ Policy already exists, skipping.`);
        } else {
          console.error(`❌ Error executing statement.`);
          console.error(`Reason: ${err.message}`);
        }
      }
    }

    console.log(`✅ RLS and Policies ${mode} sync completed.`);
  } catch (error) {
    console.error("❌ Failed to sync RLS/Policies:", error);
  }
};

module.exports = syncRLSPolicies;
