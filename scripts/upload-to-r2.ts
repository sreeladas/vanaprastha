import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const STAGING_DIR = join(import.meta.dirname, '..', '.images-staging', 'collections');

const MIME_TYPES: Record<string, string> = {
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
};

function getEnvOrThrow(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing env var: ${key}`);
  return val;
}

async function main() {
  const accountId = getEnvOrThrow('R2_ACCOUNT_ID');
  const accessKeyId = getEnvOrThrow('R2_ACCESS_KEY_ID');
  const secretAccessKey = getEnvOrThrow('R2_SECRET_ACCESS_KEY');
  const bucket = getEnvOrThrow('R2_BUCKET_NAME');

  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  console.log(`Uploading to R2 bucket: ${bucket}\n`);

  let uploaded = 0;
  let failed = 0;

  for (const collectionSlug of readdirSync(STAGING_DIR)) {
    const collectionDir = join(STAGING_DIR, collectionSlug);
    if (!statSync(collectionDir).isDirectory()) continue;

    const files = readdirSync(collectionDir).filter((f) => MIME_TYPES[extname(f).toLowerCase()]);
    console.log(`  ${collectionSlug}: ${files.length} files`);

    for (const file of files) {
      const filePath = join(collectionDir, file);
      const key = `collections/${collectionSlug}/${file}`;
      const contentType = MIME_TYPES[extname(file).toLowerCase()] || 'application/octet-stream';

      try {
        await client.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: readFileSync(filePath),
            ContentType: contentType,
            CacheControl: 'public, max-age=31536000, immutable',
          }),
        );
        uploaded++;
      } catch (e) {
        console.warn(`    failed: ${key} — ${e}`);
        failed++;
      }
    }
  }

  console.log(`\nDone. Uploaded: ${uploaded}, Failed: ${failed}`);
}

main();
