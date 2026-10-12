import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Order.css";
import { toast } from "react-toastify";

const FILTERS = ["All", "Paid", "Pending"];

const Order = ({ url }) => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const fetchAllOrders = async () => {
    setLoading(true);
    setFailed(false);
    try {
      const response = await axios.get(url + "/api/order/list");
      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        setFailed(true);
        toast.error("Could not load orders");
      }
    } catch (error) {
      setFailed(true);
      toast.error("Could not reach the server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // An order counts as paid once Stripe has confirmed it
  const isPaid = (order) => order.payment === true || order.status === "Paid";

  const stats = useMemo(() => {
    const paid = orders.filter(isPaid);
    return {
      All: orders.length,
      Paid: paid.length,
      Pending: orders.length - paid.length,
      revenue: paid.reduce((sum, o) => sum + Number(o.amount || 0), 0),
      unsent: paid.filter((o) => !o.emailSent).length,
    };
  }, [orders]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (filter === "Paid" && !isPaid(o)) return false;
      if (filter === "Pending" && isPaid(o)) return false;
      if (!q) return true;
      const email = String(o.address?.email || "").toLowerCase();
      const ref = String(o._id).slice(-8).toLowerCase();
      return email.includes(q) || ref.includes(q);
    });
  }, [orders, filter, search]);

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      : "";

  const copyEmail = async (email) => {
    try {
      await navigator.clipboard.writeText(email);
      toast.success("Email copied");
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <div className="order add">
      <div className="order-header">
        <h3>Orders</h3>
        <button className="order-refresh" onClick={fetchAllOrders} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="order-summary">
        <div className="order-stat">
          <span className="order-stat-value">${stats.revenue.toFixed(2)}</span>
          <span className="order-stat-label">Paid revenue</span>
        </div>
        <div className="order-stat">
          <span className="order-stat-value">{stats.Paid}</span>
          <span className="order-stat-label">Paid orders</span>
        </div>
        <div className="order-stat">
          <span className="order-stat-value">{stats.Pending}</span>
          <span className="order-stat-label">Pending orders</span>
        </div>
        <div className={`order-stat ${stats.unsent > 0 ? "order-stat-alert" : ""}`}>
          <span className="order-stat-value">{stats.unsent}</span>
          <span className="order-stat-label">Emails not sent</span>
        </div>
      </div>

      <div className="order-toolbar">
        <div className="order-tabs" role="tablist">
          {FILTERS.map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={filter === tab}
              className={`order-tab ${filter === tab ? "active" : ""}`}
              onClick={() => setFilter(tab)}
            >
              {tab} <span>{stats[tab]}</span>
            </button>
          ))}
        </div>
        <input
          className="order-search"
          type="search"
          placeholder="Search by email or order reference"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search orders"
        />
      </div>

      {loading && orders.length === 0 ? (
        <p className="order-empty">Loading orders...</p>
      ) : failed && orders.length === 0 ? (
        <p className="order-empty">
          Orders could not be loaded. Check that the backend is running, then press Refresh.
        </p>
      ) : visible.length === 0 ? (
        <p className="order-empty">
          {search
            ? "No orders match your search. Try a different email or reference."
            : `No ${filter === "All" ? "" : filter.toLowerCase() + " "}orders yet.`}
        </p>
      ) : (
        <div className="order-list">
          {visible.map((order) => {
            const paid = isPaid(order);
            const email = order.address?.email;
            // image of the first product in the order
            const cover = order.items.find((i) => i.img)?.img || "";
            return (
              <article key={order._id} className="order-card">
                <div className="order-cover">
                  {cover ? (
                    <img
                      src={cover}
                      alt={order.items[0]?.name || "Pattern"}
                      loading="lazy"
                    />
                  ) : (
                    <div className="order-cover-empty">No image</div>
                  )}
                  <div className="order-badges">
                    <span className={`badge ${paid ? "badge-paid" : "badge-pending"}`}>
                      {paid ? "Paid" : "Pending"}
                    </span>
                    {paid && (
                      <span
                        className={`badge ${order.emailSent ? "badge-sent" : "badge-unsent"}`}
                      >
                        {order.emailSent ? "Email sent" : "Email not sent"}
                      </span>
                    )}
                  </div>
                  {order.items.length > 1 && (
                    <span className="order-more">+{order.items.length - 1} more</span>
                  )}
                </div>

                <header className="order-card-top">
                  <div>
                    <p className="order-ref">#{String(order._id).slice(-8)}</p>
                    <p className="order-date">{formatDate(order.date)}</p>
                  </div>
                </header>

                <div className="order-email-row">
                  <p className="order-email">{email || "No email"}</p>
                  {email && (
                    <button
                      className="order-copy"
                      onClick={() => copyEmail(email)}
                      aria-label={`Copy ${email}`}
                    >
                      Copy
                    </button>
                  )}
                </div>

                <ul className="order-items">
                  {order.items.map((item, i) => (
                    <li key={i}>
                      <span className="order-item-line">
                        {order.items.length > 1 && item.img && (
                          <img className="order-thumb" src={item.img} alt="" loading="lazy" />
                        )}
                        <span>{item.name}</span>
                      </span>
                      <span className="order-qty">x {item.quantity}</span>
                    </li>
                  ))}
                </ul>

                <footer className="order-card-bottom">
                  <span>
                    {order.items.length} item{order.items.length > 1 ? "s" : ""}
                  </span>
                  <strong>${Number(order.amount).toFixed(2)}</strong>
                </footer>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Order;