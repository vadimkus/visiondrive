/**
 * Explore TimescaleDB Schema
 */
const { Client } = require('pg');

async function exploreSchema() {
  const connectionString = process.env.TIMESCALE_URL;
  
  if (!connectionString) {
    console.error('Error: TIMESCALE_URL environment variable not set');
    console.log('Usage: TIMESCALE_URL="postgres://user:pass@host:port/db" node explore-schema.js');
    process.exit(1);
  }

  const client = new Client({ 
    connectionString,
    ssl: {
      rejectUnauthorized: false  // Accept self-signed certs
    }
  });
  
  try {
    console.log('Connecting to TimescaleDB...');
    await client.connect();
    console.log('✅ Connected!\n');

    // List all tables
    console.log('📋 Tables in database:');
    console.log('=' .repeat(60));
    const tables = await client.query(`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    for (const row of tables.rows) {
      console.log(`  ${row.table_name} (${row.table_type})`);
    }
    console.log();

    // For each table, show columns and row count
    for (const table of tables.rows) {
      const tableName = table.table_name;
      
      // Get columns
      const columns = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = $1 AND table_schema = 'public'
        ORDER BY ordinal_position
      `, [tableName]);
      
      // Get row count
      const countResult = await client.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
      const count = countResult.rows[0].count;
      
      console.log(`📊 Table: ${tableName} (${count} rows)`);
      console.log('-'.repeat(60));
      
      for (const col of columns.rows) {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        console.log(`  ${col.column_name.padEnd(25)} ${col.data_type.padEnd(20)} ${nullable}`);
      }
      
      // Sample data
      if (parseInt(count) > 0) {
        const sample = await client.query(`SELECT * FROM "${tableName}" LIMIT 3`);
        console.log('\n  Sample data:');
        for (const row of sample.rows) {
          console.log('  ', JSON.stringify(row).substring(0, 200));
        }
      }
      console.log('\n');
    }

    // Check for hypertables (TimescaleDB specific)
    console.log('⏱️  TimescaleDB Hypertables:');
    console.log('=' .repeat(60));
    try {
      const hypertables = await client.query(`
        SELECT hypertable_name, num_chunks, compression_enabled
        FROM timescaledb_information.hypertables
      `);
      for (const ht of hypertables.rows) {
        console.log(`  ${ht.hypertable_name} - ${ht.num_chunks} chunks, compression: ${ht.compression_enabled}`);
      }
    } catch (e) {
      console.log('  (No hypertables or TimescaleDB extension not enabled)');
    }

  } catch (err) {
    console.error('❌ Connection error:', err.message);
  } finally {
    await client.end();
  }
}

exploreSchema();
