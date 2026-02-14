import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';

const CATEGORY_COLORS = {
    Food: '#fb923c',
    Transport: '#3b82f6',
    Entertainment: '#a855f7',
    Shopping: '#ec4899',
    Bills: '#f59e0b',
    Health: '#10b981',
    Education: '#06b6d4',
    Other: '#6b7280',
};

const CATEGORY_ICONS = {
    Food: '🍕',
    Transport: '🚗',
    Entertainment: '🎬',
    Shopping: '🛍️',
    Bills: '📄',
    Health: '💊',
    Education: '📚',
    Other: '📦',
};

function DonutChart({ data, size = 180 }) {
    const canvasRef = useRef(null);
    const total = data.reduce((sum, d) => sum + d.value, 0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || total === 0) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        ctx.scale(dpr, dpr);

        const cx = size / 2;
        const cy = size / 2;
        const radius = size / 2 - 10;
        const innerRadius = radius * 0.62;
        let startAngle = -Math.PI / 2;

        data.forEach((segment) => {
            const sliceAngle = (segment.value / total) * Math.PI * 2;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
            ctx.arc(cx, cy, innerRadius, startAngle + sliceAngle, startAngle, true);
            ctx.closePath();
            ctx.fillStyle = segment.color;
            ctx.fill();
            startAngle += sliceAngle;
        });
    }, [data, size, total]);

    return (
        <div className="donut-wrapper">
            <canvas
                ref={canvasRef}
                style={{ width: size, height: size }}
            />
            <div className="donut-center-text">
                <div className="amount">${total.toFixed(0)}</div>
                <div className="label">Total</div>
            </div>
        </div>
    );
}

export default function Dashboard() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                const res = await api.get('/expenses');
                setExpenses(res.data);
            } catch (err) {
                console.error('Failed to fetch expenses:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchExpenses();
    }, []);

    if (loading) {
        return (
            <div className="loading-spinner">
                <div className="spinner"></div>
            </div>
        );
    }

    const totalSpend = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

    const now = new Date();
    const thisMonthExpenses = expenses.filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const monthlySpend = thisMonthExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

    // Category breakdown
    const categoryMap = {};
    expenses.forEach((e) => {
        const cat = e.category || 'Other';
        categoryMap[cat] = (categoryMap[cat] || 0) + parseFloat(e.amount);
    });

    const chartData = Object.entries(categoryMap)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value]) => ({
            name,
            value,
            color: CATEGORY_COLORS[name] || CATEGORY_COLORS.Other,
        }));

    const topCategory = chartData[0]?.name || '—';

    const recentExpenses = [...expenses]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 6);

    return (
        <div className="fade-in">
            <div className="page-header">
                <h2>Dashboard</h2>
                <p>Overview of your spending habits</p>
            </div>

            {/* Summary Cards */}
            <div className="summary-grid">
                <div className="card summary-card accent fade-in stagger-1">
                    <div className="label">Total Spent</div>
                    <div className="value">${totalSpend.toFixed(2)}</div>
                    <div className="sub">{expenses.length} transactions</div>
                </div>
                <div className="card summary-card fade-in stagger-2">
                    <div className="label">This Month</div>
                    <div className="value">${monthlySpend.toFixed(2)}</div>
                    <div className="sub">{thisMonthExpenses.length} transactions</div>
                </div>
                <div className="card summary-card fade-in stagger-3">
                    <div className="label">Top Category</div>
                    <div className="value" style={{ fontSize: '1.3rem' }}>{topCategory}</div>
                    <div className="sub">
                        {chartData[0] ? `$${chartData[0].value.toFixed(2)}` : '$0.00'}
                    </div>
                </div>
                <div className="card summary-card fade-in stagger-4">
                    <div className="label">Avg per Expense</div>
                    <div className="value">
                        ${expenses.length > 0 ? (totalSpend / expenses.length).toFixed(2) : '0.00'}
                    </div>
                    <div className="sub">across all time</div>
                </div>
            </div>

            {/* Charts & Recent */}
            <div className="chart-section">
                <div className="card chart-card">
                    <h3>Spending by Category</h3>
                    {chartData.length > 0 ? (
                        <div className="donut-container">
                            <DonutChart data={chartData} />
                            <div className="chart-legend">
                                {chartData.map((d) => (
                                    <div key={d.name} className="legend-item">
                                        <span className="legend-dot" style={{ background: d.color }} />
                                        <span className="legend-label">{d.name}</span>
                                        <span className="legend-value">${d.value.toFixed(0)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="icon">📊</div>
                            <p>No expenses yet to visualize</p>
                        </div>
                    )}
                </div>

                <div className="card chart-card">
                    <h3>Recent Transactions</h3>
                    {recentExpenses.length > 0 ? (
                        <div className="recent-list">
                            {recentExpenses.map((exp) => (
                                <div key={exp.id} className="recent-item">
                                    <div
                                        className="recent-icon"
                                        style={{
                                            background: `${CATEGORY_COLORS[exp.category] || CATEGORY_COLORS.Other}18`,
                                        }}
                                    >
                                        {CATEGORY_ICONS[exp.category] || '📦'}
                                    </div>
                                    <div className="recent-details">
                                        <div className="title">{exp.title}</div>
                                        <div className="meta">
                                            {exp.category} · {new Date(exp.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="recent-amount">-${parseFloat(exp.amount).toFixed(2)}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="icon">🧾</div>
                            <p>No transactions yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
