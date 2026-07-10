const bcrypt = require('bcryptjs');
const { pool, QueryBuilder } = require('../config/db');

const mapUserRow = (row, includePassword = false) => ({
  _id: row.id,
  id: row.id,
  name: row.name,
  email: row.email,
  phone: row.phone,
  address: typeof row.address === 'string' ? JSON.parse(row.address) : row.address || {},
  role: 'user', // Default role, will be 'user' unless role_id is linked
  roleId: row.role_id,
  isActive: row.is_active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  ...(includePassword ? { password: row.password } : {})
});

const attachUserMethods = (user) => {
  user.comparePassword = async (candidatePassword) => {
    return bcrypt.compare(candidatePassword, user.password);
  };

  user.save = async () => {
    let passwordValue = user.password;
    if (passwordValue === undefined || passwordValue === null) {
      passwordValue = user._originalPassword;
    } else if (passwordValue && passwordValue !== user._originalPassword) {
      const salt = await bcrypt.genSalt(12);
      passwordValue = await bcrypt.hash(passwordValue, salt);
    }

    const { rows } = await pool.query(
      `UPDATE users SET name=$1, email=$2, password=$3, phone=$4, address=$5, role_id=$6, is_active=$7, updated_at=NOW() WHERE id=$8 RETURNING *`,
      [
        user.name,
        user.email,
        passwordValue,
        user.phone,
        JSON.stringify(user.address || {}),
        user.roleId,
        user.isActive,
        user._id
      ]
    );

    if (rows[0]) {
      const updated = mapUserRow(rows[0], false);
      Object.assign(user, updated);
      user._originalPassword = rows[0].password;
      user.password = rows[0].password;
    }

    return user;
  };

  return user;
};

const User = {
  findOne(query = {}) {
    return new QueryBuilder(async (queryBuilder) => {
      const conditions = [];
      const values = [];

      if (query.email) {
        conditions.push(`email = $${values.length + 1}`);
        values.push(query.email);
      }

      let sql = 'SELECT * FROM users';
      if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(' AND ')}`;
      }

      const { rows } = await pool.query(sql, values);
      const row = rows[0];
      if (!row) return null;
      const shouldIncludePassword = queryBuilder.selectFields && queryBuilder.selectFields.includes('+password');
      return attachUserMethods(mapUserRow(row, shouldIncludePassword));
    });
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (!rows[0]) return null;
    const user = attachUserMethods(mapUserRow(rows[0], false));
    user._originalPassword = rows[0].password;
    return user;
  },

  async create(data) {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    // Get default 'user' role ID
    let roleId = data.roleId;
    if (!roleId) {
      const { rows: roleRows } = await pool.query(
        'SELECT id FROM roles WHERE name = $1',
        ['user']
      );
      roleId = roleRows[0]?.id || null;
    }

    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password, phone, address, role_id, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING *`,
      [
        data.name,
        data.email,
        hashedPassword,
        data.phone || null,
        JSON.stringify(data.address || {}),
        roleId,
        data.isActive !== undefined ? data.isActive : true
      ]
    );

    const user = attachUserMethods(mapUserRow(rows[0], false));
    user._originalPassword = rows[0].password;
    return user;
  },

  async findByIdAndUpdate(id, data, options = {}) {
    const existing = await this.findById(id);
    if (!existing) return null;
    Object.assign(existing, data);
    if (options.new === false) return existing;
    return existing.save();
  },

  async deleteMany() {
    await pool.query('DELETE FROM users');
    return { deletedCount: 1 };
  }
};

module.exports = User;
