import { File } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

export const MAX_COMPLAINT_IMAGES = 5;

const MAX_IMAGE_DIMENSION = 1600;
const MAX_SOURCE_FILE_SIZE = 50 * 1024 * 1024;
const MAX_UPLOAD_FILE_SIZE = 5 * 1024 * 1024;
const JPEG_QUALITY = 0.82;
const FALLBACK_JPEG_QUALITIES = [0.68, 0.54];
let generatedFileName = 0;

export async function prepareComplaintImage(asset) {
  if (!asset?.uri) {
    throw new Error('The selected photo has no accessible file.');
  }
  if (asset.type && asset.type !== 'image' && asset.type !== 'livePhoto') {
    throw new Error('Only photos can be added to a complaint.');
  }
  if (Number.isFinite(asset.fileSize) && asset.fileSize > MAX_SOURCE_FILE_SIZE) {
    throw new Error('The selected photo is too large. Choose a photo under 50 MB.');
  }

  let context = ImageManipulator.manipulate(asset.uri, {
    maxWidth: MAX_IMAGE_DIMENSION,
    maxHeight: MAX_IMAGE_DIMENSION,
  });
  if (Math.max(asset.width || 0, asset.height || 0) > MAX_IMAGE_DIMENSION) {
    context = context.resize(
      asset.width >= asset.height
        ? { width: MAX_IMAGE_DIMENSION }
        : { height: MAX_IMAGE_DIMENSION }
    );
  }

  const image = await context.renderAsync();
  let result;
  let fileSize;
  for (const quality of [JPEG_QUALITY, ...FALLBACK_JPEG_QUALITIES]) {
    result = await image.saveAsync({
      format: SaveFormat.JPEG,
      compress: quality,
      base64: false,
    });
    if (!result.uri || result.width <= 0 || result.height <= 0) {
      throw new Error('The photo could not be prepared. Please choose it again.');
    }

    fileSize = new File(result.uri).size;
    if (!Number.isFinite(fileSize)) {
      throw new Error('The prepared photo size could not be checked. Please choose it again.');
    }
    if (fileSize <= MAX_UPLOAD_FILE_SIZE) break;
  }

  if (!result?.uri || fileSize == null || fileSize > MAX_UPLOAD_FILE_SIZE) {
    throw new Error('This photo is still over 5 MB after compression. Choose a smaller photo.');
  }
  if (result.width <= 0 || result.height <= 0) {
    throw new Error('The photo could not be prepared. Please choose it again.');
  }

  const originalName = asset.fileName || `civicfix-complaint-${Date.now()}-${generatedFileName++}`;
  const baseName = originalName.replace(/\.[^/.]+$/, '');
  const prepared = {
    uri: result.uri,
    fileName: `${baseName}.jpg`,
    mimeType: 'image/jpeg',
    width: result.width,
    height: result.height,
    fileSize,
    sourceUri: asset.uri,
    assetId: asset.assetId || null,
  };
  if (Number.isFinite(asset.fileSize)) {
    prepared.sourceFileSize = asset.fileSize;
  }
  return prepared;
}
