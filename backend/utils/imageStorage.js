import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import ImageKit from 'imagekit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });
const uploadsRoot = path.join(__dirname, '../uploads');

const publicKey = process.env.IMAGEKIT_PUBLIC_KEY?.trim();
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY?.trim();
const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT?.trim();

export const isImageKitConfigured = () =>
  Boolean(
    publicKey &&
      privateKey &&
      urlEndpoint &&
      !publicKey.includes('YOUR_') &&
      !privateKey.includes('YOUR_')
  );

let imagekitClient = null;
const getImageKit = () => {
  if (!isImageKitConfigured()) return null;
  if (!imagekitClient) {
    imagekitClient = new ImageKit({ publicKey, privateKey, urlEndpoint });
  }
  return imagekitClient;
};

const uniqueName = (originalName = 'file') => {
  const ext = path.extname(originalName) || '';
  const safe = path.basename(originalName, ext).replace(/[^\w.-]+/g, '_').slice(0, 40);
  return `${safe}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
};

const writeLocal = (file, folder) => {
  const dir = folder ? path.join(uploadsRoot, folder) : uploadsRoot;
  fs.mkdirSync(dir, { recursive: true });
  const filename = uniqueName(file.originalname);
  fs.writeFileSync(path.join(dir, filename), file.buffer);
  const url = folder ? `/uploads/${folder}/${filename}` : `/uploads/${filename}`;
  return { url, publicId: null, originalName: file.originalname };
};

export const saveUpload = async (file, folder = '') => {
  if (!file) return null;

  const kit = getImageKit();
  if (kit && file.buffer) {
    try {
      const result = await kit.upload({
        file: file.buffer.toString('base64'),
        fileName: uniqueName(file.originalname),
        folder: `/civicfix/${folder || 'uploads'}`,
        useUniqueFileName: true,
      });
      const url = result.url || result.data?.url;
      const publicId = result.fileId || result.data?.fileId;
      if (url) {
        return { url, publicId: publicId || null, originalName: file.originalname };
      }
    } catch (error) {
      console.error('[ImageKit] Upload failed, using local disk:', error.message);
    }
  }

  if (file.filename) {
    const url = folder ? `/uploads/${folder}/${file.filename}` : `/uploads/${file.filename}`;
    return { url, publicId: null, originalName: file.originalname };
  }

  if (file.buffer) {
    return writeLocal(file, folder);
  }

  if (file.path) {
    return {
      url: `/uploads/${path.basename(file.path)}`,
      publicId: null,
      originalName: file.originalname,
    };
  }

  return null;
};

export const saveUploads = async (files = [], folder = '') => {
  const stored = [];
  for (const file of files) {
    const item = await saveUpload(file, folder);
    if (item) stored.push(item);
  }
  return stored;
};
