// queues/imageQueue.js
import { Queue } from 'bullmq';
import { emitNotification } from '../../config (db connect)/socket.io.js';
import path from 'path';

export const imageQueue = new Queue('image-processing', {
  connection: { host: '127.0.0.1', port: 6379 },
});

// helper to extract clean filename after the first "-"
const extractFileName = (localPath) => {
  if (!localPath) return 'Unknown file';
  const base = path.basename(localPath); // e.g. 172399320-image-1.jpg
  const parts = base.split('-');
  return parts.length > 1 ? parts.slice(1).join('-') : base; // "image-1.jpg"
};

// Called inside createChapter or addImages service
export async function queueImageProcessing({ imageId, localPath }) {
  const fileName = extractFileName(localPath);

  console.log(`[Producer] Queueing image: ${fileName}`);

  // Send initial notification that image is queued
  const notification = {
    type: 'queued',
    message: `"${fileName}" added to processing queue`,
    fileName,
    progress: 0
  };

  console.log('[Producer] Sending notification:', notification);
  emitNotification(notification);

  await imageQueue.add('process-image', { imageId, localPath });
  console.log(`[Producer] Image ${fileName} added to queue successfully`);
}
