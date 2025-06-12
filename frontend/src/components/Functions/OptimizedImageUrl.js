function getOptimizedCloudinaryUrl(originalUrl) {
    const uploadIndex = originalUrl.indexOf('/upload/');
    if (uploadIndex === -1) return originalUrl; // Not a valid Cloudinary upload URL
  
    const beforeUpload = originalUrl.slice(0, uploadIndex + 8); // includes '/upload/'
    const afterUpload = originalUrl.slice(uploadIndex + 8);     // everything after '/upload/'
  
    return `${beforeUpload}f_auto,q_auto/${afterUpload}`;
  }

  export default getOptimizedCloudinaryUrl;
  