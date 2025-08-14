import React, { useEffect, useState } from 'react';
import api from '../api/axios';


export default function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        setLoading(true);
        const res = await api.get('transaction/');
        setTransactions(res.data);
      } catch {
        setError('Failed to fetch transactions');
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, []);

  return (
    <div>
      <h1>Transactions & Commissions</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{color:'red'}}>{error}</p>}
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>ID</th>
            <th>Property</th>
            <th>Buyer</th>
            <th>Agent</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Commission %</th>
            <th>Commission Amount</th>
            <th>Signed At</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(tx => (
            <tr key={tx.id}>
              <td>{tx.id}</td>
              <td>{tx.property ? tx.property.title : '-'}</td>
              <td>{tx.buyer ? tx.buyer.full_name : '-'}</td>
              <td>{tx.agent ? tx.agent.username : '-'}</td>
              <td>{tx.transaction_type}</td>
              <td>${tx.amount?.toLocaleString()}</td>
              <td>{tx.commission_percent}%</td>
              <td>${tx.commission_amount?.toLocaleString()}</td>
              <td>{new Date(tx.signed_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
