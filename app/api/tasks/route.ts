import { NextResponse } from 'next/server';
import { pool, errorMessage } from '@/lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

const SELECT_COLUMNS = 'id, title, completed, created_at';

export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT ${SELECT_COLUMNS} FROM tasks ORDER BY created_at DESC, id DESC`
    );

    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json(
      { error: errorMessage(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const title = typeof body?.title === 'string' ? body.title.trim() : '';

    if (!title) {
      return NextResponse.json(
        { error: 'Judul tugas wajib diisi.' },
        { status: 400 }
      );
    }

    if (title.length > 255) {
      return NextResponse.json(
        { error: 'Judul tugas maksimal 255 karakter.' },
        { status: 400 }
      );
    }

    // Insert data pakai placeholder ?
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO tasks (title) VALUES (?)',
      [title]
    );

    // Ambil data yang baru dibuat pakai insertId
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT ${SELECT_COLUMNS} FROM tasks WHERE id = ?`,
      [result.insertId]
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: errorMessage(error) },
      { status: 500 }
    );
  }
}