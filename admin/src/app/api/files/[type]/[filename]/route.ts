'use server';
import { NextRequest } from 'next/server';
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
      mainAssets: 'storage/mainAssets/main',
      userAssets: 'storage/userAssets',
      products: 'storage/productAssets',
    };

    if (!type || !filename || !(type in storageDirectory)) {
      return new Response(JSON.stringify(responseStructure(false, 'Invalid Request')), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const filePath = path.join(process.cwd(), storageDirectory[type], decodeURIComponent(filename));

    if (!fs.existsSync(filePath)) {
      return new Response(JSON.stringify(responseStructure(false, 'File Not Found')), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const mimeType = mime.lookup(filePath) || 'application/octet-stream';

    const fileStream = fs.createReadStream(filePath);
    const readableStream = new ReadableStream({
      start(controller) {
        fileStream.on('data', (chunk) => controller.enqueue(chunk));
        fileStream.on('end', () => controller.close());
        fileStream.on('error', (err) => controller.error(err));
      },
    });

    const headers = new Headers({
      'Content-Type': mimeType,
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_USER_API ??   '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });

    return new Response(readableStream, { headers });
  } catch (error) {
    return new Response(JSON.stringify(responseStructure(false, handleCatchErrors(error))), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}