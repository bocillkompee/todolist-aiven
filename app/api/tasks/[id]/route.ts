import { NextResponse } from 'next/server';
import { pool, errorMessage } from '@/lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

const SELECT_COLUMNS = 'id, title, completed, created_at';

type RouteContext = {
  params: Promise<{ id: string }>;
};

function parseId(rawId: string): number | null {
  const id = Number(rawId);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const { id: rawId } = await params;
    const id = parseId(rawId);

    if (id === null) {
      return NextResponse.json(
        { error: 'ID tugas tidak valid.' },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Payload tidak valid.' },
        { status: 400 }
      );
    }

    const columns: string[] = [];
    const values: (string | boolean | number)[] = [];

    if (body.title !== undefined) {
      const title = typeof body.title === 'string' ? body.title.trim() : '';

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

      values.push(title);
      columns.push('title = ?');
    }

    if (body.completed !== undefined) {
      if (typeof body.completed !== 'boolean') {
        return NextResponse.json(
          { error: 'Status completed harus boolean.' },
          { status: 400 }
        );
      }

      values.push(body.completed);
      columns.push('completed = ?');
    }

    if (columns.length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada data yang diperbarui.' },
        { status: 400 }
      );
    }

    values.push(id);

    // Update data pakai MySQL
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE tasks SET ${columns.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Tugas tidak ditemukan.' },
        { status: 404 }
      );
    }

    // Ambil data terbaru setelah di-update
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT ${SELECT_COLUMNS} FROM tasks WHERE id = ?`,
      [id]
    );

    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json(
      { error: errorMessage(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const { id: rawId } = await params;
    const id = parseId(rawId);

    if (id === null) {
      return NextResponse.json(
        { error: 'ID tugas tidak valid.' },
        { status: 400 }
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM tasks WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Tugas tidak ditemukan.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json(
      { error: errorMessage(error) },
      { status: 500 }
    );
  }
}