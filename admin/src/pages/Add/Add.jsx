import React, { useState } from 'react'
import "./Add.css"
import { assets } from '../../assets/assets'
import { toast } from 'react-toastify'

const Add = ({ url }) => {
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState({
    name: "",
    pdfLink: "",
    description: "",
    price: "",
    category: "Halloween"
  });

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const onImageChangeHandler = (event) => {
    const files = Array.from(event.target.files);
    setImages((prev) => [...prev, ...files]);
    event.target.value = "";
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onVideoChangeHandler = (event) => {
    const files = Array.from(event.target.files);
    setVideos((prev) => [...prev, ...files]);
    event.target.value = "";
  };

  const removeVideo = (index) => {
    setVideos((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadVideoToCloudinary = async (file) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/video/upload`,
      { method: "POST", body: fd }
    );
    if (!res.ok) throw new Error("Video upload failed");
    const json = await res.json();
    return json.secure_url;
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (isSubmitting) return; // guard against double-clicks

    if (images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    setIsSubmitting(true);

    try {
      const videoUrls = await Promise.all(videos.map(uploadVideoToCloudinary));

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("pdfLink", data.pdfLink);
      formData.append("description", data.description);
      formData.append("price", Number(data.price));
      formData.append("category", data.category);
      formData.append("videos", JSON.stringify(videoUrls));

      images.forEach((img) => {
        formData.append("images", img);
      });

      const response = await fetch(`${url}/api/food/add`, {
        method: "POST",
        body: formData
      });

      if (response.ok) {
        toast.success("Food Added Successfully");
        setData({
          name: "",
          pdfLink: "",
          description: "",
          price: "",
          category: "Salad"
        });
        setImages([]);
        setVideos([]);
      } else {
        toast.error("Error adding food");
      }
    } catch (error) {
      toast.error("Network Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='add'>
      <form className='flex-col' onSubmit={onSubmitHandler}>
        <div className="add-img-upload flex-col">
          <p>Upload Images</p>

          <div className="add-img-previews">
            {images.map((img, index) => (
              <div className="add-img-preview" key={index}>
                <img src={URL.createObjectURL(img)} alt={`preview-${index}`} />
                <span
                  className="add-img-remove"
                  onClick={() => removeImage(index)}
                >
                  &times;
                </span>
              </div>
            ))}

            <label htmlFor="image" className="add-img-add-more">
              <img src={assets.upload_area} alt="upload" />
            </label>
          </div>

          <input
            onChange={onImageChangeHandler}
            type="file"
            id="image"
            name="images"
            accept="image/*"
            multiple
            hidden
            disabled={isSubmitting}
          />
        </div>

        <div className="add-img-upload flex-col">
          <p>Upload Videos (optional)</p>

          <div className="add-img-previews">
            {videos.map((vid, index) => (
              <div className="add-img-preview" key={index}>
                <video src={URL.createObjectURL(vid)} muted />
                <span
                  className="add-img-remove"
                  onClick={() => removeVideo(index)}
                >
                  &times;
                </span>
              </div>
            ))}

            <label htmlFor="video" className="add-img-add-more">
              <img src={assets.upload_area} alt="upload video" />
            </label>
          </div>

          <input
            onChange={onVideoChangeHandler}
            type="file"
            id="video"
            accept="video/*"
            multiple
            hidden
            disabled={isSubmitting}
          />
        </div>

        <div className="add-product-name flex-col">
          <p>Product name</p>
          <input onChange={onChangeHandler} value={data.name} type="text" name='name' placeholder='Type here' required disabled={isSubmitting} />
        </div>
        <div className="add-product-name flex-col">
          <p>PDF link</p>
          <input onChange={onChangeHandler} value={data.pdfLink} type="text" name='pdfLink' placeholder='Type here' required disabled={isSubmitting} />
        </div>
        <div className="add-product-description flex-col">
          <p>Product Description</p>
          <textarea onChange={onChangeHandler} value={data.description} name="description" rows="6" placeholder='Write content here' required disabled={isSubmitting}></textarea>
        </div>
        <div className="add-category-price">
          <div className="add-category flex-col">
            <p>Product category</p>
            <select onChange={onChangeHandler} name="category" value={data.category} disabled={isSubmitting}>
              <option value="Halloween">Halloween</option>
              <option value="Chrismis">Chrismis</option>
              <option value="Flowers">Flowers</option>
              <option value="Sea Animals">Sea Animals</option>
              <option value="Car Hanging">Car Hanging</option>
              <option value="Nurse & Lab Crochet">Nurse & Lab Crochet</option>
              <option value="Easter Day">Easter Day</option>
              <option value="Valentine">Valentine</option>
            </select>
          </div>
          <div className="add-price flex-col">
            <p>Product price</p>
            <input onChange={onChangeHandler} value={data.price} type="Number" name='price' placeholder='$20' required disabled={isSubmitting} />
          </div>
        </div>

        <button type='submit' className='add-btn' disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="spinner"></span>
              Adding...
            </>
          ) : (
            "ADD"
          )}
        </button>
      </form>
    </div>
  );
};

export default Add;