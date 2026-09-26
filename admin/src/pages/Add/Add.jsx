import React, { useState } from 'react'
import "./Add.css"
import { assets } from '../../assets/assets'
import { toast } from 'react-toastify'

const Add = ({ url }) => {
  const [images, setImages] = useState([]); // array of File objects
  const [data, setData] = useState({
    name: "",
    pdfLink: "",
    description: "",
    price: "",
    category: "Salad"
  });

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const onImageChangeHandler = (event) => {
    const files = Array.from(event.target.files);
    setImages((prev) => [...prev, ...files]);
    // allow re-selecting the same file(s) again later
    event.target.value = "";
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("pdf", data.pdfLink)
    formData.append("description", data.description);
    formData.append("price", Number(data.price));
    formData.append("category", data.category);

    // append each image; backend should read multiple files under "images"
    images.forEach((img) => {
      formData.append("images", img);
    });

    try {
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
      } else {
        toast.error("Error adding food");
      }
    } catch (error) {
      toast.error("Network Error");
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
          />
        </div>

        <div className="add-product-name flex-col">
          <p>Product name</p>
          <input onChange={onChangeHandler} value={data.name} type="text" name='name' placeholder='Type here' required />
        </div>
        <div className="add-product-name flex-col">
          <p>PDF link</p>
          <input onChange={onChangeHandler} value={data.pdfLink} type="text" name='pdfLink' placeholder='Type here' required />
        </div>
        <div className="add-product-description flex-col">
          <p>Product Description</p>
          <textarea onChange={onChangeHandler} value={data.description} name="description" rows="6" placeholder='Write content here' required></textarea>
        </div>
        <div className="add-category-price">
          <div className="add-category flex-col">
            <p>Product category</p>
            <select onChange={onChangeHandler} name="category" value={data.category}>
              <option value="Salad">Salad</option>
              <option value="Rolls">Rolls</option>
              <option value="Deserts">Deserts</option>
              <option value="Sandwich">Sandwich</option>
              <option value="Cake">Cake</option>
              <option value="Pure Veg">Pure Veg</option>
              <option value="Pasta">Pasta</option>
              <option value="Noodles">Noodles</option>
            </select>
          </div>
          <div className="add-price flex-col">
            <p>Product price</p>
            <input onChange={onChangeHandler} value={data.price} type="Number" name='price' placeholder='$20' required />
          </div>
        </div>

        <button type='submit' className='add-btn'>ADD</button>
      </form>
    </div>
  );
};

export default Add;