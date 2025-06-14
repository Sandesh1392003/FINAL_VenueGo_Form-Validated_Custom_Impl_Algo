const getOptimizedCloudinaryUrl = (originalUrl) => {
  if (!originalUrl || typeof originalUrl !== 'string') return null;

  const uploadIndex = originalUrl.indexOf('/upload/');
  if (uploadIndex === -1) return originalUrl;

  const beforeUpload = originalUrl.slice(0, uploadIndex + 8); // includes '/upload/'
  const afterUpload = originalUrl.slice(uploadIndex + 8);     // everything after '/upload/'

  return `${beforeUpload}f_auto,q_auto/${afterUpload}`;
};

export default getOptimizedCloudinaryUrl;
