import React, { useState } from 'react';
import './LoanCalculator.css';

function formatCurrency(n) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(n);
}

export default function LoanCalculator() {
  const [loanAmount, setLoanAmount]       = useState(100000);
  const [interestRate, setInterestRate]   = useState(10);
  const [transactions, setTransactions]   = useState([]); // withdrawals
  const [repayments, setRepayments]       = useState([]);

  const [txDate,  setTxDate]              = useState('');
  const [txAmt,   setTxAmt]               = useState('');
  const [rpDate,  setRpDate]              = useState('');
  const [rpAmt,   setRpAmt]               = useState('');

  // sums
  const totalWithdrawn = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalRepaid    = repayments.reduce((sum, r) => sum + r.amount, 0);
  const netUsed        = Math.max(0, totalWithdrawn - totalRepaid);
  const interestOwed   = (netUsed * interestRate) / 100;

  const percentUsed = Math.min(100, (netUsed / loanAmount) * 100);

  // group tx by month
  const monthly = transactions.reduce((acc, { date, amount }) => {
    const m = new Date(date).toLocaleDateString('en-IN', { year:'numeric', month:'short' });
    if (!acc[m]) acc[m] = { withdrawn:0, interest:0 };
    acc[m].withdrawn += amount;
    acc[m].interest  = (acc[m].withdrawn * interestRate)/100;
    return acc;
  }, {});

  function addTransaction(e) {
    e.preventDefault();
    if (!txDate || !txAmt || +txAmt <= 0) return;
    setTransactions(t => [...t, { id:Date.now(), date:txDate, amount:+txAmt }]);
    setTxDate(''); setTxAmt('');
  }

  function addRepayment(e) {
    e.preventDefault();
    if (!rpDate || !rpAmt || +rpAmt <= 0) return;
    setRepayments(r => [...r, { id:Date.now(), date:rpDate, amount:+rpAmt }]);
    setRpDate(''); setRpAmt('');
  }

  return (
    <div className="loan-calc">
      <section className="inputs">
        <div className="input-group">
          <label>Loan Amount</label>
          <input type="number" value={loanAmount}
            onChange={e=>setLoanAmount(+e.target.value)} />
        </div>
        <div className="input-group">
          <label>Interest Rate (%)</label>
          <input type="number" value={interestRate}
            onChange={e=>setInterestRate(+e.target.value)} />
        </div>
      </section>

      <section className="progress">
        <div>Used: {formatCurrency(netUsed)} / {formatCurrency(loanAmount)}</div>
        <progress max="100" value={percentUsed}></progress>
        <div>{percentUsed.toFixed(1)}% tapped</div>
      </section>

      <section className="forms">
        <form onSubmit={addTransaction}>
          <h3>➕ Add Withdrawal</h3>
          <input type="date"   value={txDate} onChange={e=>setTxDate(e.target.value)} required/>
          <input type="number" placeholder="Amount" value={txAmt}
            onChange={e=>setTxAmt(e.target.value)} required/>
          <button type="submit">Record Withdrawal</button>
        </form>

        <form onSubmit={addRepayment}>
          <h3>🔄 Add Repayment</h3>
          <input type="date"   value={rpDate} onChange={e=>setRpDate(e.target.value)} required/>
          <input type="number" placeholder="Amount" value={rpAmt}
            onChange={e=>setRpAmt(e.target.value)} required/>
          <button type="submit">Record Repayment</button>
        </form>
      </section>

      <section className="summary">
        <h3>📊 Summary</h3>
        <p>Total Withdrawn: {formatCurrency(totalWithdrawn)}</p>
        <p>Total Repaid:    {formatCurrency(totalRepaid)}</p>
        <p>Net Used:        {formatCurrency(netUsed)}</p>
        <p>Interest Owed:   {formatCurrency(interestOwed)}</p>
      </section>

      <section className="history">
        <h3>🗂️ Transaction History</h3>
        <table>
          <thead><tr><th>Date</th><th>Withdrawn</th></tr></thead>
          <tbody>
            {transactions.map(t=>(
              <tr key={t.id}>
                <td>{new Date(t.date).toLocaleDateString()}</td>
                <td>{formatCurrency(t.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="history">
        <h3>💰 Repayment History</h3>
        <table>
          <thead><tr><th>Date</th><th>Repaid</th></tr></thead>
          <tbody>
            {repayments.map(r=>(
              <tr key={r.id}>
                <td>{new Date(r.date).toLocaleDateString()}</td>
                <td>{formatCurrency(r.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="monthly">
        <h3>🗓️ Monthly Breakdown</h3>
        <table>
          <thead><tr><th>Month</th><th>Withdrawn</th><th>Interest</th></tr></thead>
          <tbody>
            {Object.entries(monthly).map(([month,data])=>(
              <tr key={month}>
                <td>{month}</td>
                <td>{formatCurrency(data.withdrawn)}</td>
                <td>{formatCurrency(data.interest)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
