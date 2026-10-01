import React, { useState, useEffect, useMemo } from 'react'
import "./Add.css"
import { assets } from '../../assets/assets'
import { toast } from 'react-toastify'

const DEFAULT_CATEGORY = "Halloween";

const Add = ({ url }) => {
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [data, setData] = useState({
    name: "",
    pdfLink: "",
    description: "",
    price: "",
    category: DEFAULT_CATEGORY
  });

  // Create preview URLs once per file and clean them up (avoids memory leaks
  // and flickering from creating a new blob URL on every render)
  const imagePreviews = useMemo(
    () => images.map((file) => URL.createObjectURL(file)),
    [images]
  );
  const videoPreviews = useMemo(
    () => videos.map((file) => URL.createObjectURL(file)),
    [videos]
  );

  useEffect(() => {
    return () => imagePreviews.forEach((u) => URL.revokeObjectURL(u));
  }, [imagePreviews]);

  useEffect(() => {
    return () => videoPreviews.forEach((u) => URL.revokeObjectURL(u));
  }, [videoPreviews]);

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

  // Uploads one video straight from the browser to Cloudinary.
  // Throws an Error carrying Cloudinary's real message if it fails.
  const uploadVideoToCloudinary = async (file) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !preset) {
      throw new Error(
        "Cloudinary env vars are missing (VITE_CLOUDINARY_CLOUD_NAME / VITE_CLOUDINARY_UPLOAD_PRESET). Add them in Vercel and redeploy."
      );
    }

    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", preset);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
      { method: "POST", body: fd }
    );

    let json = {};
    try {
      json = await res.json();
    } catch {
      // response was not JSON; fall through to the generic message
    }

    if (!res.ok) {
      throw new Error(
        json?.error?.message || `Video upload failed (status ${res.status})`
      );
    }
    return json.secure_url;
  };

  const resetForm = () => {
    setData({
      name: "",
      pdfLink: "",
      description: "",
      price: "",
      category: DEFAULT_CATEGORY
    });
    setImages([]);
    setVideos([]);
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
      // 1. Upload videos one at a time (more reliable than all in parallel)
      const videoUrls = [];
      for (let i = 0; i < videos.length; i++) {
        setStatusText(`Uploading video ${i + 1} of ${videos.length}...`);
        try {
          videoUrls.push(await uploadVideoToCloudinary(videos[i]));
        } catch (err) {
          throw new Error(`Video "${videos[i].name}": ${err.message}`);
        }
      }

      // 2. Send everything else to the backend (videos go as URLs only)
      setStatusText("Saving product...");
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

      // Backend returns JSON for success/failure, plain text for validation errors
      const raw = await response.text();
      let result = null;
      try {
        result = JSON.parse(raw);
      } catch {
        // plain text response
      }

      if (response.ok && result?.success) {
        toast.success("Product added");
        resetForm();
      } else {
        toast.error(result?.message || raw || "Error adding product");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
      setStatusText("");
    }
  };

  return (
    <div className='add'>
      <form className='flex-col' onSubmit={onSubmitHandler}>
        <div className="add-img-upload flex-col">
          <p>Upload Images</p>

          <div className="add-img-previews">
            {imagePreviews.map((src, index) => (
              <div className="add-img-preview" key={src}>
                <img src={src} alt={`preview-${index}`} />
                <span
                  className="add-img-remove"
                  onClick={() => !isSubmitting && removeImage(index)}
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
            {videoPreviews.map((src, index) => (
              <div className="add-img-preview" key={src}>
                <video src={src} muted />
                <span
                  className="add-img-remove"
                  onClick={() => !isSubmitting && removeVideo(index)}
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
            <input onChange={onChangeHandler} value={data.price} type="number" min="0" step="any" name='price' placeholder='$20' required disabled={isSubmitting} />
          </div>
        </div>

        <button type='submit' className='add-btn' disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="spinner"></span>
              {statusText || "Adding..."}
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