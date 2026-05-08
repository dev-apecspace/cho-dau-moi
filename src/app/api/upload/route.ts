import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'cho-dau-moi';

    if (!file) {
      console.error('No file found in formData');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log(`Uploading file: ${file.name} (${file.size} bytes) to folder: ${folder}`);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary using a Promise to handle the stream-based upload
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'auto',
        },
        (error, result) => {
          try {
            if (error) {
              console.error('Cloudinary upload callback error:', error);
              reject(error);
            } else {
              resolve(result);
            }
          } catch (e) {
            reject(e);
          }
        }
      );
      
      uploadStream.end(buffer);
    }) as any;

    console.log('Cloudinary upload success:', result.secure_url);
    return NextResponse.json({
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
