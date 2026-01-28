// services/bull-MQ/worker.js
import mongoose from 'mongoose';
import { Worker } from 'bullmq';
import Image from '../../models/Image.model.js';
import extractTextFromCloudinaryUrl from '../image-processing/aws.js';
import { processWithAI, getProviderName } from '../image-processing/ai-provider.js';
import searchYouTubeVideos from '../image-processing/youtube-data-api.js';
import { emitNotification } from '../../config (db connect)/socket.io.js';
import path from 'path';

// helper to extract clean filename after the first "-"
const extractFileName = (localPath) => {
  if (!localPath) return 'Unknown file';
  const base = path.basename(localPath); // e.g. 172399320-image-1.jpg
  const parts = base.split('-');
  return parts.length > 1 ? parts.slice(1).join('-') : base; // "image-1.jpg"
};

export const startWorker = () => {
  const worker = new Worker(
    'image-processing',
    async (job) => {
      try {
        const { imageId, localPath } = job.data;
        const fileName = extractFileName(localPath);

        console.log(` Starting job for image: ${fileName}`);
        emitNotification({
          type: 'processing',
          message: `Started processing "${fileName}"`,
          fileName,
          progress: 0
        });

        // Extract text
        await job.updateProgress(10);
        console.log(`[10%] Extracting text from ${fileName}...`);
        emitNotification({
          type: 'processing',
          message: `Extracting text from "${fileName}"...`,
          fileName,
          progress: 10
        });
        const extractedText =
          await extractTextFromCloudinaryUrl(localPath);

        // AI processing (Gemini or Groq based on AI_PROVIDER env)
        await job.updateProgress(40);
        const providerName = getProviderName();
        console.log(`[40%] Sending ${fileName} text to ${providerName}...`);
        emitNotification({
          type: 'processing',
          message: `${providerName} analyzing "${fileName}"...`,
          fileName,
          progress: 40
        });
        let aiResult = await processWithAI(extractedText);

        if (typeof aiResult === 'string') {
          try {
            aiResult = JSON.parse(aiResult);
          } catch (err) {
            console.error(
              ` Failed to parse ${providerName} result:`,
              aiResult
            );
            throw err;
          }
        }

        console.log(aiResult);

        // Extract structured data
        await job.updateProgress(60);
        console.log(
          `[60%] Processing ${providerName} response for ${fileName}...`
        );
        emitNotification({
          type: 'processing',
          message: `Processing AI response for "${fileName}"...`,
          fileName,
          progress: 60
        });
        const ocr = aiResult[0].ocr;
        const enhancedText = aiResult[1].enhancedAIExplanation;
        const keywords = aiResult[2].ytKeywords.join(' ');

        // Search YouTube
        await job.updateProgress(80);
        console.log(
          `[80%] Fetching YouTube videos for ${fileName}...`
        );
        emitNotification({
          type: 'processing',
          message: `Fetching YouTube videos for "${fileName}"...`,
          fileName,
          progress: 80
        });
        const videos = await searchYouTubeVideos(keywords);

        // Save to DB
        await job.updateProgress(95);
        console.log(
          `[95%] Saving ${fileName} results to database...`
        );
        emitNotification({
          type: 'processing',
          message: `Saving "${fileName}" to database...`,
          fileName,
          progress: 95
        });
        await Image.findByIdAndUpdate(imageId, {
          ocr,
          enhancedText,
          videos,
        });

        await job.updateProgress(100);
        console.log(` [100%] Completed job for image: ${fileName}`);
        emitNotification({
          type: 'success',
          message: `"${fileName}" processed successfully!`,
          fileName,
          progress: 100
        });
        return {
          imageId,
        };
      } catch (err) {
        console.error(
          ` Failed to process image ${job.data.imageId}:`,
          err
        );
        throw err;
      }
    },
    {
      connection: {
        host: '127.0.0.1',
        port: 6379,
      },
      settings: {
        backoffStrategies: {
          customBackoff: () => 10000,
        },
      },
    }
  );

  // Job events
  worker.on('progress', (job, progress) => {
    const fileName = extractFileName(job.data.localPath);
    console.log(`Job ${job.id} (${fileName}) progress: ${progress}%`);
  });

  worker.on('completed', (job) => {
    const fileName = extractFileName(job.data.localPath);
    console.log(`Job completed: ${job.id} (${fileName})`);
    emitNotification({
      type: 'success',
      message: `"${fileName}" completed successfully!`,
      fileName,
      progress: 100
    });
  });

  worker.on('failed', (job, err) => {
    const fileName = extractFileName(job?.data?.localPath);
    console.error(`Job failed: ${job?.id} (${fileName})`, err);
    emitNotification({
      type: 'error',
      message: `Processing "${fileName}" failed!`,
      fileName,
      error: err.message
    });
  });
};
