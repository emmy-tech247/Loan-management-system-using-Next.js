'use server';

import pool from '@/lib/db';

export async function testDatabaseConnection() {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS solution');
    return { success: true, message: 'Database connected successfully!', data: rows };
  } catch (error: any) {
    console.error('Database connection failed:', error.message);
    return { success: false, message: `Connection failed: ${error.message}` };
  }
}