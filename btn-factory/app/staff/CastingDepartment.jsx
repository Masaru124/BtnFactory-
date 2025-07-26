import React, { useState, useEffect } from 'react';

const CastingDepartment = ({ onSubmit }) => {
  const [token, setToken] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [rawMaterialsUsed, setRawMaterialsUsed] = useState('');
  const [sheetsMade, setSheetsMade] = useState('');
  const [sheetsWasted, setSheetsWasted] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');

  const fetchOrderData = async (token) => {
    try {
      const response = await fetch(`/api/orders/${token}`);
      if (!response.ok) {
        setError('Order not found');
        setOrderData(null);
        return;
      }
      const data = await response.json();
      setOrderData(data);
      setError('');
    } catch (err) {
      setError('Error fetching order data');
      setOrderData(null);
    }
  };

  useEffect(() => {
    if (token.length > 0) {
      fetchOrderData(token);
    } else {
      setOrderData(null);
      setError('');
    }
  }, [token]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      token,
      rawMaterialsUsed,
      sheetsMade: Number(sheetsMade),
      sheetsWasted: Number(sheetsWasted),
      startTime,
      endTime,
    });
  };

  return (
    <div>
      <h2>Casting Department Interface</h2>
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
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {orderData && (
          <div>
            <p><strong>Image:</strong> {orderData.buttonImage || 'N/A'}</p>
            <p><strong>Casting Type:</strong> {orderData.casting}</p>
            <p><strong>Number of Lines:</strong> {orderData.linings || 'N/A'}</p>
            <p><strong>Number of Holes:</strong> {orderData.holes}</p>
            <p><strong>Quantity:</strong> {orderData.quantity || 'N/A'}</p>
            <p><strong>Raw Materials:</strong> {orderData.rawMaterial?.materialName || 'N/A'}</p>
          </div>
        )}
        <div>
          <label>Raw Materials Used:</label>
          <input
            type="text"
            value={rawMaterialsUsed}
            onChange={(e) => setRawMaterialsUsed(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Sheets Made:</label>
          <input
            type="number"
            value={sheetsMade}
            onChange={(e) => setSheetsMade(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Sheets Wasted:</label>
          <input
            type="number"
            value={sheetsWasted}
            onChange={(e) => setSheetsWasted(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Start Time:</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>
        <div>
          <label>End Time:</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default CastingDepartment;
