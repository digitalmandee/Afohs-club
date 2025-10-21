import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { format } from 'date-fns';

export default function RunningSalesOrdersPrint({ runningOrders, totalOrders, totalAmount, reportDate }) {
    useEffect(() => {
        // Auto-print when page loads
        const timer = setTimeout(() => {
            window.print();
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), 'dd/MM/yyyy');
        } catch (error) {
            return dateString;
        }
    };

    const formatTime = (dateString) => {
        try {
            return format(new Date(dateString), 'HH:mm:ss');
        } catch (error) {
            return dateString;
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
        }).format(amount).replace('PKR', 'Rs');
    };

    return (
        <>
            <Head title="Running Sales Orders - Print" />

            <style jsx global>{`
                @media print {
                    body {
                        margin: 0;
                        padding: 15px;
                        font-family: Arial, sans-serif;
                        font-size: 10px;
                        line-height: 1.2;
                    }
                    .no-print {
                        display: none !important;
                    }

                    .report-header {
                        text-align: center;
                        margin-bottom: 20px;
                        border-bottom: 2px solid #000;
                        padding-bottom: 10px;
                    }

                    .report-title {
                        font-size: 16px;
                        font-weight: bold;
                        margin: 5px 0;
                    }

                    .report-subtitle {
                        font-size: 14px;
                        font-weight: bold;
                        margin: 3px 0;
                    }

                    .report-info {
                        font-size: 10px;
                        margin: 2px 0;
                    }

                    .main-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 20px;
                        font-size: 8px;
                        border: 1px solid #000;
                    }

                    .main-table th {
                        background-color: #f0f0f0;
                        border-bottom: 1px solid #000;
                        padding: 4px 2px;
                        font-weight: bold;
                        text-align: center;
                        font-size: 8px;
                    }

                    .main-table td {
                        border-bottom: 1px solid #000;
                        padding: 3px 2px;
                        text-align: center;
                        font-size: 8px;
                    }

                    .text-left {
                        text-align: left !important;
                    }

                    .text-right {
                        text-align: right !important;
                    }

                    .font-bold {
                        font-weight: bold;
                    }

                    .summary-footer {
                        background-color: #000;
                        color: white;
                        font-weight: bold;
                        text-align: center;
                        padding: 10px;
                        margin-top: 20px;
                        font-size: 11px;
                    }
                }
                @media screen {
                    body {
                        background-color: white;
                        padding: 20px;
                        font-family: Arial, sans-serif;
                    }
                }
            `}</style>

            <div style={{ margin: '0 auto', backgroundColor: 'white', padding: '20px' }}>
                {/* Header */}
                <div className="report-header">
                    <div className="report-title">AFOHS</div>
                    <div className="report-subtitle">RUNNING SALES ORDERS</div>
                    <div className="report-info">
                        Date: {formatDate(reportDate)} | Generated: {formatDate(new Date())} {formatTime(new Date())}
                    </div>
                    <div className="report-info">
                        Total Orders: {totalOrders} | Total Amount: {formatCurrency(totalAmount)}
                    </div>
                </div>

                {/* Orders Table */}
                {runningOrders && Array.isArray(runningOrders) && runningOrders.length > 0 ? (
                    <table className="main-table">
                        <thead>
                            <tr>
                                <th style={{ width: '30px' }}>SR</th>
                                <th style={{ width: '60px' }}>ORDER#</th>
                                <th style={{ width: '60px' }}>DATE</th>
                                <th style={{ width: '50px' }}>TIME</th>
                                <th style={{ width: '50px' }}>TABLE</th>
                                <th style={{ width: '100px' }}>RESTAURANT</th>
                                <th style={{ width: '80px' }}>CUSTOMER NAME</th>
                                <th style={{ width: '80px' }}>CUSTOMER #</th>
                                {/* <th style={{ width: '40px' }}>ITEMS</th> */}
                                <th style={{ width: '70px' }}>TOTAL AMOUNT</th>
                                <th style={{ width: '60px' }}>CASHIER</th>
                                <th style={{ width: '60px' }}>STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {runningOrders.map((order, index) => (
                                <tr key={order.id}>
                                    <td className="font-bold">{index + 1}</td>
                                    <td className="font-bold">{order.invoice_no || order.id}</td>
                                    <td>{formatDate(order.created_at)}</td>
                                    <td>{formatTime(order.created_at)}</td>
                                    <td className="font-bold">{order.table?.table_no || order.table_id || 'N/A'}</td>
                                    <td className="text-left">{order.tenant?.name || 'N/A'}</td>
                                    <td>{order.member?.full_name || 'N/A'}</td>
                                    <td>{order.member?.membership_no || 'N/A'}</td>
                                    {/* <td className="font-bold">{order.total_items || 'N/A'}</td> */}
                                    <td className="font-bold text-right">{formatCurrency(order.total_price || 0)}</td>
                                    <td>{order.cashier_name || 'N/A'}</td>
                                    <td className="font-bold">{(order.status === 'pending' ? 'Running' : order.status) || 'Pending'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <div style={{ fontSize: '14px' }}>No running orders found for today</div>
                        <div style={{ fontSize: '12px', marginTop: '10px' }}>All orders have been completed or there are no orders yet.</div>
                    </div>
                )}

                {/* Summary Footer */}
                {runningOrders && runningOrders.length > 0 && (
                    <div className="summary-footer">
                        TOTAL RUNNING ORDERS: {totalOrders} | TOTAL AMOUNT: {formatCurrency(totalAmount)}
                    </div>
                )}
            </div>
        </>
    );
}
