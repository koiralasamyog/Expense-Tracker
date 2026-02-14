import { useState, useEffect } from 'react';
import api from '../api/axios';

const CATEGORIES = [
    'Food',
    'Transport',
    'Entertainment',
    'Shopping',
    'Bills',
    'Health',
    'Education',
    'Other',
];

const CATEGORY_CLASS = {
    Food: 'food',
    Transport: 'transport',
    Entertainment: 'entertainment',
    Shopping: 'shopping',
    Bills: 'bills',
    Health: 'health',
    Education: 'education',
};

function ExpenseModal({ expense, onClose, onSave }) {
    const isEdit = !!expense;
    const [form, setForm] = useState({
        title: expense?.title || '',
        amount: expense?.amount || '',
        category: expense?.category || 'Food',
        date: expense?.date
            ? new Date(expense.date).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
        notes: expense?.notes || '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            if (isEdit) {
                const res = await api.put(`/expenses/${expense.id}`, form);
                onSave(res.data, 'update');
            } else {
                const res = await api.post('/expenses', form);
                onSave(res.data, 'create');
            }
            onClose();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.errors?.[0]?.msg ||
                'Something went wrong'
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{isEdit ? 'Edit Expense' : 'Add Expense'}</h3>
                    <button className="modal-close" onClick={onClose}>
                        ✕
                    </button>
                </div>

                {error && (
                    <div className="alert alert-error">
                        <span>⚠️</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="exp-title">Title</label>
                        <input
                            id="exp-title"
                            name="title"
                            type="text"
                            className="form-control"
                            placeholder="e.g. Grocery shopping"
                            value={form.title}
                            onChange={handleChange}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="exp-amount">Amount ($)</label>
                            <input
                                id="exp-amount"
                                name="amount"
                                type="number"
                                step="0.01"
                                min="0.01"
                                className="form-control"
                                placeholder="0.00"
                                value={form.amount}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="exp-category">Category</label>
                            <select
                                id="exp-category"
                                name="category"
                                className="form-control"
                                value={form.category}
                                onChange={handleChange}
                            >
                                {CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="exp-date">Date</label>
                        <input
                            id="exp-date"
                            name="date"
                            type="date"
                            className="form-control"
                            value={form.date}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="exp-notes">Notes (optional)</label>
                        <textarea
                            id="exp-notes"
                            name="notes"
                            className="form-control"
                            placeholder="Any extra details..."
                            value={form.notes}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Saving...' : isEdit ? 'Update' : 'Add Expense'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function ConfirmModal({ message, onConfirm, onClose }) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 380 }}>
                <div className="confirm-dialog">
                    <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🗑️</div>
                    <h3 style={{ marginBottom: 8 }}>Delete Expense?</h3>
                    <p>{message}</p>
                </div>
                <div className="modal-footer" style={{ justifyContent: 'center' }}>
                    <button className="btn btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="btn btn-danger" onClick={onConfirm}>
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Expenses() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editExpense, setEditExpense] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterMonth, setFilterMonth] = useState('');

    const fetchExpenses = async () => {
        try {
            const params = {};
            if (filterCategory !== 'All') params.category = filterCategory;
            if (filterMonth) params.month = filterMonth;
            const res = await api.get('/expenses', { params });
            setExpenses(res.data);
        } catch (err) {
            console.error('Failed to fetch expenses:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, [filterCategory, filterMonth]);

    const handleSave = (expense, type) => {
        if (type === 'create') {
            setExpenses((prev) => [expense, ...prev]);
        } else {
            setExpenses((prev) => prev.map((e) => (e.id === expense.id ? expense : e)));
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await api.delete(`/expenses/${deleteTarget.id}`);
            setExpenses((prev) => prev.filter((e) => e.id !== deleteTarget.id));
        } catch (err) {
            console.error('Failed to delete expense:', err);
        }
        setDeleteTarget(null);
    };

    const openEdit = (expense) => {
        setEditExpense(expense);
        setShowModal(true);
    };

    const openAdd = () => {
        setEditExpense(null);
        setShowModal(true);
    };

    const totalFiltered = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

    return (
        <div className="fade-in">
            <div className="page-header">
                <h2>Expenses</h2>
                <p>Manage your transactions</p>
            </div>

            {/* Toolbar */}
            <div className="toolbar">
                <select
                    className="form-control filter-select"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    id="filter-category"
                >
                    <option value="All">All Categories</option>
                    {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>

                <input
                    type="month"
                    className="form-control"
                    style={{ maxWidth: 180 }}
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                    id="filter-month"
                />

                {filterMonth && (
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setFilterMonth('')}
                    >
                        Clear
                    </button>
                )}

                <div className="spacer" />

                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Total: <strong style={{ color: 'var(--text-primary)' }}>${totalFiltered.toFixed(2)}</strong>
                </span>

                <button className="btn btn-primary" onClick={openAdd} id="add-expense-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Expense
                </button>
            </div>

            {/* Table */}
            <div className="card">
                {loading ? (
                    <div className="loading-spinner">
                        <div className="spinner" />
                    </div>
                ) : expenses.length === 0 ? (
                    <div className="empty-state">
                        <div className="icon">💸</div>
                        <h3>No expenses found</h3>
                        <p>
                            {filterCategory !== 'All' || filterMonth
                                ? 'Try adjusting your filters'
                                : 'Click "Add Expense" to record your first transaction'}
                        </p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="expense-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Category</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Notes</th>
                                    <th style={{ width: 100 }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.map((exp) => (
                                    <tr key={exp.id}>
                                        <td style={{ fontWeight: 600 }}>{exp.title}</td>
                                        <td>
                                            <span className={`category-badge ${CATEGORY_CLASS[exp.category] || ''}`}>
                                                {exp.category}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                            {new Date(exp.date).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </td>
                                        <td>
                                            <span className="expense-amount">
                                                -${parseFloat(exp.amount).toFixed(2)}
                                            </span>
                                        </td>
                                        <td
                                            style={{
                                                color: 'var(--text-muted)',
                                                fontSize: '0.82rem',
                                                maxWidth: 200,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {exp.notes || '—'}
                                        </td>
                                        <td>
                                            <div className="actions-cell">
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    onClick={() => openEdit(exp)}
                                                    title="Edit"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    onClick={() => setDeleteTarget(exp)}
                                                    title="Delete"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modals */}
            {showModal && (
                <ExpenseModal
                    expense={editExpense}
                    onClose={() => setShowModal(false)}
                    onSave={handleSave}
                />
            )}

            {deleteTarget && (
                <ConfirmModal
                    message={
                        <>
                            This will permanently remove{' '}
                            <span className="highlight">&quot;{deleteTarget.title}&quot;</span>.
                        </>
                    }
                    onConfirm={handleDelete}
                    onClose={() => setDeleteTarget(null)}
                />
            )}
        </div>
    );
}
