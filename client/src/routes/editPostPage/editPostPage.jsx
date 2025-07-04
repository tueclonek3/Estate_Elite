import { useEffect, useState, useRef, forwardRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import apiRequest from "../../lib/apiRequest";
import UploadWidget from "../../components/uploadWidget/UploadWidget";
import "./editPostPage.scss"; // Reuse the same styling as NewPostPage

const CustomQuill = forwardRef(({ value, onChange }, ref) => {
  const quillRef = useRef(null);

  const handleChange = (content) => {
    onChange(content);
  };

  return (
    <ReactQuill
      ref={(el) => {
        if (el) {
          quillRef.current = el;
          if (ref) {
            if (typeof ref === "function") {
              ref(el);
            } else {
              ref.current = el;
            }
          }
        }
      }}
      theme="snow"
      value={value}
      onChange={handleChange}
    />
  );
});

function EditPostPage() {
  const { id } = useParams();
  const [value, setValue] = useState("");
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const quillRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiRequest.get(`/posts/${id}`);
        setFormData(res.data);
        setValue(res.data.postDetail.desc);
        setImages(res.data.images);
      } catch (err) {
        console.error(err);
        setError("Failed to load post data");
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData) return;
    
    try {
      await apiRequest.put(`/posts/${id}`, {
        title: formData.title,
        price: parseInt(formData.price),
        address: formData.address,
        city: formData.city,
        bedroom: parseInt(formData.bedroom),
        bathroom: parseInt(formData.bathroom),
        type: formData.type,
        property: formData.property,
        latitude: formData.latitude,
        longitude: formData.longitude,
        images: images,
        postDetail: {
          desc: value,
          utilities: formData.postDetail.utilities,
          pet: formData.postDetail.pet,
          income: formData.postDetail.income,
          size: parseInt(formData.postDetail.size),
          school: parseInt(formData.postDetail.school),
          bus: parseInt(formData.postDetail.bus),
          restaurant: parseInt(formData.postDetail.restaurant),
        }
      });
      navigate(`/${id}`);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Update failed");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      postDetail: {
        ...prev.postDetail,
        [name]: value
      }
    }));
  };

  if (!formData) return <div className="editPostPage">Loading...</div>;

  return (
    <div className="editPostPage">
      <div className="formContainer">
        <h1>Edit Post</h1>
        <div className="wrapper">
          <form onSubmit={handleSubmit}>
            <div className="item">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
              />
            </div>
            
            <div className="item">
              <label htmlFor="price">Price</label>
              <input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
              />
            </div>
            
            <div className="item">
              <label htmlFor="address">Address</label>
              <input
                id="address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
            
            <div className="item description">
              <label htmlFor="desc">Description</label>
              <CustomQuill 
                value={value} 
                onChange={setValue} 
                ref={quillRef} 
              />
            </div>
            
            <div className="item">
              <label htmlFor="city">City</label>
              <input
                id="city"
                name="city"
                type="text"
                value={formData.city}
                onChange={handleChange}
              />
            </div>
            
            <div className="item">
              <label htmlFor="bedroom">Bedroom Number</label>
              <input
                min={1}
                id="bedroom"
                name="bedroom"
                type="number"
                value={formData.bedroom}
                onChange={handleChange}
              />
            </div>
            
            <div className="item">
              <label htmlFor="bathroom">Bathroom Number</label>
              <input
                min={1}
                id="bathroom"
                name="bathroom"
                type="number"
                value={formData.bathroom}
                onChange={handleChange}
              />
            </div>
            
            <div className="item">
              <label htmlFor="latitude">Latitude</label>
              <input
                id="latitude"
                name="latitude"
                type="text"
                value={formData.latitude}
                onChange={handleChange}
              />
            </div>
            
            <div className="item">
              <label htmlFor="longitude">Longitude</label>
              <input
                id="longitude"
                name="longitude"
                type="text"
                value={formData.longitude}
                onChange={handleChange}
              />
            </div>
            
            <div className="item">
              <label htmlFor="type">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="rent">Rent</option>
                <option value="buy">Buy</option>
              </select>
            </div>
            
            <div className="item">
              <label htmlFor="property">Property</label>
              <select
                name="property"
                value={formData.property}
                onChange={handleChange}
              >
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="condo">Condo</option>
                <option value="land">Land</option>
              </select>
            </div>
            
            <div className="item">
              <label htmlFor="utilities">Utilities Policy</label>
              <select
                name="utilities"
                value={formData.postDetail.utilities}
                onChange={handleDetailChange}
              >
                <option value="owner">Owner is responsible</option>
                <option value="tenant">Tenant is responsible</option>
                <option value="shared">Shared</option>
              </select>
            </div>
            
            <div className="item">
              <label htmlFor="pet">Pet Policy</label>
              <select
                name="pet"
                value={formData.postDetail.pet}
                onChange={handleDetailChange}
              >
                <option value="allowed">Allowed</option>
                <option value="not-allowed">Not Allowed</option>
              </select>
            </div>
            
            <div className="item">
              <label htmlFor="income">Income Policy</label>
              <input
                id="income"
                name="income"
                type="text"
                placeholder="Income Policy"
                value={formData.postDetail.income}
                onChange={handleDetailChange}
              />
            </div>
            
            <div className="item">
              <label htmlFor="size">Total Size (sqft)</label>
              <input
                min={0}
                id="size"
                name="size"
                type="number"
                value={formData.postDetail.size}
                onChange={handleDetailChange}
              />
            </div>
            
            <div className="item">
              <label htmlFor="school">School</label>
              <input
                min={0}
                id="school"
                name="school"
                type="number"
                value={formData.postDetail.school}
                onChange={handleDetailChange}
              />
            </div>
            
            <div className="item">
              <label htmlFor="bus">Bus</label>
              <input
                min={0}
                id="bus"
                name="bus"
                type="number"
                value={formData.postDetail.bus}
                onChange={handleDetailChange}
              />
            </div>
            
            <div className="item">
              <label htmlFor="restaurant">Restaurant</label>
              <input
                min={0}
                id="restaurant"
                name="restaurant"
                type="number"
                value={formData.postDetail.restaurant}
                onChange={handleDetailChange}
              />
            </div>
            
            <button className="sendButton">Update Post</button>
            {error && <span className="error">{error}</span>}
          </form>
        </div>
      </div>
      
      <div className="sideContainer">
        {images.map((image, index) => (
          <img src={image} key={index} alt="" />
        ))}
        <UploadWidget
          uwConfig={{
            multiple: true,
            cloudName: "dnyu5pmrn",
            uploadPreset: "estate",
            folder: "posts",
          }}
          setState={setImages}
        />
      </div>
    </div>
  );
}

export default EditPostPage;