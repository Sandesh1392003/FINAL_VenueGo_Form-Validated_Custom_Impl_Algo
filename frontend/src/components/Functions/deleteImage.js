import { useContext } from "react";
import { GET_DELETE_SIGNATURE } from "../Graphql/mutations/getSignature";
import { useMutation } from "@apollo/client";
import { AuthContext } from "../../middleware/AuthContext";

export const useDeleteImage = () => {
  const {CLOUD_NAME} = useContext(AuthContext)
  const [getDeleteSignature, { error, loading }] = useMutation(GET_DELETE_SIGNATURE);

  const deleteImage = async (publicId) => {
    try {
      // Request the signature from the backend for image deletion
      const res = await getDeleteSignature({
        variables: {
          publicId,
        },
      });

      const { timestamp, signature } = res.data?.getDeleteSignature;

      // Make a request to Cloudinary to delete the image
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`,
        {
          method: "POST",
          body: JSON.stringify({
            public_id: publicId,
            api_key: import.meta.env.VITE_CLOUD_API_KEY,
            timestamp,
            signature,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete image from Cloudinary");
      }

      const result = await response.json();
      
      return result;
    } catch (err) {
      console.log("Error deleting image", err);
      throw new Error(err.message);
    }
  };

  return { deleteImage, error, loading };
};
