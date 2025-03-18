'use server';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import mime from 'mime-types';
import { handleCatchErrors, responseStructure } from '@/utils/commonUtils';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ type: string; filename: string }> }
) {
  try {
    const { type, filename } = await context.params;

    const storageDirectory: Record<string, string> = {
      mainAssets: 'public/assets/mainAssets/main',
      userAssets: 'public/assets/userAssets',
      products: 'public/assets/productAssets',
    };

    if (!type || !filename || !(type in storageDirectory)) {
      return NextResponse.json(responseStructure(false, 'Invalid Request'), {
        status: 400,
      });
    }

    const filePath = path.join(
      process.cwd(),
      storageDirectory[type],
      decodeURIComponent(filename)
    );

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