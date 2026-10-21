import { NextResponse } from 'next/server';
import { pool, errorMessage } from '@/lib/db';
import type { RowDataPacket } from 'mysql2';

export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT NOW() AS server_time');

    return NextResponse.json({
      success: true,
      message: 'Koneksi ke database berhasil.',
      serverTime: rows[0].server_time,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: errorMessage(error) },
      { status: 500 }
    );
  }
}