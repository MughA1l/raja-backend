import fs from 'fs/promises';
import AWS from 'aws-sdk';
import dotenv from 'dotenv';
dotenv.config();

AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const textract = new AWS.Textract();

async function extractTextFromLocalFile(filePath) {
  console.log('ocr started');
  console.log(filePath);
  console.time();

  // Read local image file
  const imageBuffer = await fs.readFile(filePath);

  const data = await textract
    .detectDocumentText({
      Document: { Bytes: imageBuffer },
    })
    .promise();

  // Delete local file after successful OCR
  try {
    await fs.unlink(filePath);
    console.log(`Deleted local file: ${filePath}`);
  } catch (err) {
    console.error(`Failed to delete local file ${filePath}`, err);
  }

  console.log('ocr ended');
  console.timeEnd();

  return data.Blocks.filter((block) => block.BlockType === 'LINE')
    .map((block) => block.Text)
    .join('\n');
}

export default extractTextFromLocalFile;
