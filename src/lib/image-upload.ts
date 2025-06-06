interface ImgbbResponse {
  data: {
    url: string;
    display_url: string;
  };
  success: boolean;
}

export const uploadImageToImgbb = async (file: File): Promise<string> => {
  const apiKey = "86fead5481033870cdd5eac92c18ac6a";
  const formData = new FormData();
  formData.append("image", file);
  formData.append("key", apiKey);

  try {
    const response = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const data: ImgbbResponse = await response.json();

    if (!data.success) {
      throw new Error("Image upload failed");
    }

    return data.data.url;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Không thể tải ảnh lên. Vui lòng thử lại.");
  }
};
