/*
 * Author MUHAMMED YAZEEN AN
 * Created on Thu Sep 26 2024
 */
const {
  BlobServiceClient,
  StorageSharedKeyCredential,
} = require('@azure/storage-blob');

/**
 * Uploads file buffer to Azure Blob Storage.
 * Adds a virtual directory based on the PO number, category, and environment before uploading.
 *
 * @param {Buffer} fileBuffer - File data stored in memory.
 * @param {string} fileName - Name of the blob in Azure Storage.
 * @param {string} containerName - Azure container to store the blob.
 * @param {string} poNumber - Purchase order number to create the directory.
 * @param {string} category - category to create the directory.
 * @returns {Object} - Object containing public URL, filename, old name, and createdAt timestamp.
 */
const uploadToAzureBlob = async ({
  fileBuffer,
  fileName,
  containerName,
  poNumber,
  category,
}) => {
  try {
    const blobServiceClient = createBlobServiceClient();
    const containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists();

    const timestamp = Date.now();
    const newName = `${timestamp}_${fileName}`;
    const env = process.env.NODE_ENV || 'development';
    const virtualDirectory =
      env !== 'production' ? 'development' : 'production';

    // Create virtual directory based on PO number and category
    const finalFileName = sanitize(`${virtualDirectory}/${poNumber}/${category}/${newName}`);

    const blockBlobClient = containerClient.getBlockBlobClient(finalFileName);
    await blockBlobClient.uploadData(fileBuffer);

    const createdAt = new Date().toISOString();

    return {
      publicUrl: blockBlobClient.url,
      fileName: newName,
      oldName: fileName,
      createdAt,
    };
  } catch (error) {
    throw new Error(`Failed to upload to Azure Blob Storage: ${error.message}`);
  }
};

module.exports = { uploadToAzureBlob };

// ***************************************** helper *********************************************

/**
 * Create the Blob Service Client for Azure Blob Storage using credentials.
 */
const createBlobServiceClient = () => {
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;

  if (!accountName || !accountKey) {
    throw new Error('Azure storage account name or key is missing.');
  }

  const sharedKeyCredential = new StorageSharedKeyCredential(
    accountName,
    accountKey
  );
  return new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    sharedKeyCredential
  );
};

/**
 * Sanitize the file name to replace all non-alphanumeric characters (except dots) with underscores.
 * Only allow capital letters, small letters, numbers, and dots.
 *
 * @param {string} fileName - The original file name to sanitize.
 * @returns {string} - The sanitized file name.
 */
const sanitize = (fileName) => {
  return fileName.replace(/[^a-zA-Z0-9.]/g, '_').replace(/_+/g, '_');
};
