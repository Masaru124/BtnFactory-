import React, { useState } from 'react';

const RawMaterialDepartment = ({ onSubmit }) => {
  const [token, setToken] = useState('');
  const [materialName, setMaterialName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [totalPrice, setTotalPrice] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ token, materialName, quantity: Number(quantity), totalPrice: Number(totalPrice) });
  };

  return (
    <div>
      <h2>Raw Material Department Interface</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Order ID / Token Number:</label>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Material Name:</label>
          <input
            type="text"
            value={materialName}
            onChange={(e) => setMaterialName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Quantity:</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Total Price:</label>
          <input
            type="number"
            value={totalPrice}
            onChange={(e) => setTotalPrice(e.target.value)}
            required
          />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default RawMaterialDepartment;
