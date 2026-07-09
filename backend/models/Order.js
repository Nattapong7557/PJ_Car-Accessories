const { pool, QueryBuilder } = require('../config/db');

const mapOrderRow = (row) => ({
  _id: row.id,
  id: row.id,
  user: row.user_id,
  items: Array.isArray(row.items) ? row.items : [],
  shippingAddress: typeof row.shipping_address === 'string' ? JSON.parse(row.shipping_address) : row.shipping_address || {},
  paymentMethod: row.payment_method,
  paymentStatus: row.payment_status,
  subtotal: Number(row.subtotal),
  shippingCost: Number(row.shipping_cost),
  discount: Number(row.discount),
  totalAmount: Number(row.total_amount),
  status: row.status,
  trackingNumber: row.tracking_number,
  note: row.note,
  paidAt: row.paid_at,
  deliveredAt: row.delivered_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const attachOrderMethods = (order) => {
  order.save = async () => {
    const { rows } = await pool.query(
      `UPDATE orders SET user_id=$1, items=$2, shipping_address=$3, payment_method=$4, payment_status=$5, subtotal=$6, shipping_cost=$7, discount=$8, total_amount=$9, status=$10, tracking_number=$11, note=$12, paid_at=$13, delivered_at=$14, updated_at=NOW() WHERE id=$15 RETURNING *`,
      [
        order.user,
        JSON.stringify(order.items || []),
        JSON.stringify(order.shippingAddress || {}),
        order.paymentMethod,
        order.paymentStatus || 'pending',
        order.subtotal,
        order.shippingCost ?? 0,
        order.discount ?? 0,
        order.totalAmount,
        order.status || 'pending',
        order.trackingNumber || null,
        order.note || null,
        order.paidAt || null,
        order.deliveredAt || null,
        order._id
      ]
    );

    if (rows[0]) {
      Object.assign(order, mapOrderRow(rows[0]));
    }

    return order;
  };

  return order;
};

const Order = {
  find(query = {}) {
    return new QueryBuilder(async (queryBuilder) => {
      const conditions = [];
      const values = [];

      if (query.user) {
        conditions.push(`user_id = $${values.length + 1}`);
        values.push(query.user);
      }

      if (query.status) {
        conditions.push(`status = $${values.length + 1}`);
        values.push(query.status);
      }

      let sql = 'SELECT * FROM orders';
      if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(' AND ')}`;
      }

      sql += ' ORDER BY created_at DESC';
      sql += ` OFFSET $${values.length + 1}`;
      values.push(queryBuilder.skipValue || 0);
      if (queryBuilder.limitValue) {
        sql += ` LIMIT $${values.length + 1}`;
        values.push(queryBuilder.limitValue);
      }

      const { rows } = await pool.query(sql, values);
      return rows.map(mapOrderRow);
    });
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    return rows[0] ? attachOrderMethods(mapOrderRow(rows[0])) : null;
  },

  async create(data) {
    const { rows } = await pool.query(
      `INSERT INTO orders (user_id, items, shipping_address, payment_method, payment_status, subtotal, shipping_cost, discount, total_amount, status, tracking_number, note, paid_at, delivered_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW()) RETURNING *`,
      [
        data.user,
        JSON.stringify(data.items || []),
        JSON.stringify(data.shippingAddress || {}),
        data.paymentMethod,
        data.paymentStatus || 'pending',
        data.subtotal,
        data.shippingCost ?? 0,
        data.discount ?? 0,
        data.totalAmount,
        data.status || 'pending',
        data.trackingNumber || null,
        data.note || null,
        data.paidAt || null,
        data.deliveredAt || null
      ]
    );

    return rows[0] ? attachOrderMethods(mapOrderRow(rows[0])) : null;
  },

  async countDocuments(query = {}) {
    const conditions = [];
    const values = [];

    if (query.user) {
      conditions.push(`user_id = $${values.length + 1}`);
      values.push(query.user);
    }

    if (query.status) {
      conditions.push(`status = $${values.length + 1}`);
      values.push(query.status);
    }

    let sql = 'SELECT COUNT(*)::int AS count FROM orders';
    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    const { rows } = await pool.query(sql, values);
    return rows[0].count;
  }
};

module.exports = Order;
