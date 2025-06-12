export const validateImage = (image) => {
    return image && image.public_id && image.secure_url;
  };
  
  export const validateLocation = (address) => {
    return true;
  };
  
  export const validateEsewaId = (esewaId) => {
    return esewaId && esewaId.length === 10;
  };
  