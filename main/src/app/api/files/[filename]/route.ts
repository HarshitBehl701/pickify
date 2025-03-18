import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import mime from 'mime-types';
import { handleCatchErrors, responseStructure } from '@/utils/commonUtils';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await context.params;

    if (!filename) {
      return NextResponse.json(responseStructure(false, 'Invalid Request'), {
        status: 400,
      });
    }

    const filePath = path.join(process.cwd(), 'public/assets/users', filename);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(responseStructure(false, 'File Not Found'), {
        status: 404,
      });
    }

    const mimeType = mime.lookup(filePath) || 'application/octet-stream';
    const fileStream = fs.createReadStream(filePath);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new NextResponse(fileStream as any, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return NextResponse.json(
      responseStructure(false, handleCatchErrors(error)),
      { status: 500 }
    );
  }
}