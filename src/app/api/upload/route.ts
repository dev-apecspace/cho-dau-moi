import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import { localUploadUrl } from '@/lib/upload-paths';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'cho-dau-moi';

    if (!file) {
      console.error('No file found in formData');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log(`Saving file locally: ${file.name} (${file.size} bytes) to folder: ${folder}`);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const publicUrl = localUploadUrl(folder, file.name, randomUUID());
    const relativePath = publicUrl.replace(/^\/+/, '').split('/');
    const diskPath = path.join(process.cwd(), 'public', ...relativePath);

    await mkdir(path.dirname(diskPath), { recursive: true });
    await writeFile(diskPath, buffer);

    console.log('Local upload success:', publicUrl);
    return NextResponse.json({
      url: publicUrl,
      public_id: publicUrl,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
