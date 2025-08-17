import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    axios.get('/api/transactions/', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('accessToken')
      }
    })
    .then(res => setTransactions(res.data))
    .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>Transactions & Commissions</h2>
      <table>
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
              <td>{tx.property_name || '-'}</td>
              <td>{tx.buyer_name || '-'}</td>
              <td>{tx.agent_name || '-'}</td>
              <td>{tx.transaction_type || '-'}</td>
              <td>{tx.amount != null ? `$${tx.amount.toLocaleString()}` : '-'}</td>
              <td>{tx.commission_percent != null ? `${tx.commission_percent}%` : '-'}</td>
              <td>{tx.commission_amount != null ? `$${tx.commission_amount.toLocaleString()}` : '-'}</td>
              <td>{tx.signed_at ? new Date(tx.signed_at).toLocaleDateString() : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionList;
