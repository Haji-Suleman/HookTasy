import React, { useEffect, useState } from 'react';
import { toast } from "react-toastify";
import "./List.css";
import axios from 'axios';
import Popup from '../Popup/popup';

const List = ({ url }) => {
  const [list, setList] = useState([]);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchList = async () => {
    const response = await axios.get(`${url}/api/food/list`)
    if (response.data.success) {
      setList(response.data.data)
    }
    else {
      toast.error("Error Ocurred")
    }
  };

  const confirmRemove = (item) => {
    setConfirmTarget(item);
  };

  const cancelRemove = () => {
    setConfirmTarget(null);
  };

  const removeFood = async () => {
    if (!confirmTarget) return;
    setDeleting(true);
    try {
      const response = await axios.post(`${url}/api/food/remove`, { id: confirmTarget._id });
      await fetchList();
      if (response.data.success) {
        toast.success(response.data.message);
      } else {
        toast.error("Error");
      }
    } catch (error) {
      toast.error("Network Error");
    } finally {
      setDeleting(false);
      setConfirmTarget(null);
    }
  };

  useEffect(() => {
    fetchList()
  }, []);

  return (
    <div className='list add flex-col'>
      <p>All Foods List</p>
      <div className="list-table">
        <div className="list-table-format title">
          <b>Image</b>
          <b>Name</b>
          <b>PDF</b>
          <b>Category</b>
          <b>Price</b>
          <b>Action</b>
        </div>
        {list.map((item, index) => {
          return (
            <div key={item._id ?? index} className='list-table-format'>
              <img
                src={item.images && item.images.length > 0 ? `${url}/images/${item.images[0]}` : ""}
                alt=""
                loading='lazy'
                onClick={() => setSelectedItem(item)}
                style={{ cursor: 'pointer' }}
              />
              <p onClick={() => setSelectedItem(item)} style={{ cursor: 'pointer' }}>
                {item.name}
              </p>
              <a href={item.pdfLink} target="_blank" rel="noopener noreferrer">pdf</a>
              <p>{item.category}</p>
              <p>{item.price}</p>
              <p className='cursor' onClick={() => confirmRemove(item)}>X</p>
            </div>
          )
        })}
      </div>

      {confirmTarget && (
        <div className="confirm-overlay" onClick={cancelRemove}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">!</div>
            <h3>Delete this product?</h3>
            <p>
              Are you sure you want to delete <b>{confirmTarget.name}</b>?
              This action cannot be undone.
            </p>
            <div className="confirm-actions">
              <button
                className="confirm-btn confirm-btn--cancel"
                onClick={cancelRemove}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="confirm-btn confirm-btn--delete"
                onClick={removeFood}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedItem && (
        <Popup
          item={selectedItem}
          url={url}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
};

export default List;