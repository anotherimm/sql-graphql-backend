const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomUUID } = require("crypto");
const db = require("../config/db");

module.exports = {
  //root query resolvers
  getEventPermissionList: async (parent, { pagination }) => {
    const { take = 10, skip = 0 } = pagination || {};
    const [rows] = await db.query(
      "SELECT * FROM event_permissions WHERE verified_at IS NOT NULL LIMIT ? OFFSET ?",
      [take, skip]
    );
    const [[{ total }]] = await db.query(
      "SELECT COUNT(*) as total FROM event_permissions WHERE verified_at IS NOT NULL"
    );
    return { data: rows, total, totalFiltered: rows.length };
  },

  getEventPermissionVerifikasiList: async (parent, { pagination }, context) => {
    if (!context.user || context.user.role !== "VERIFIKATOR")
      throw new Error("Access denied. Verifikator role required.");
    const { take = 10, skip = 0 } = pagination || {};
    const [rows] = await db.query(
      `SELECT ep.* FROM event_permissions ep JOIN users u ON ep.user_id = u.id WHERE ep.verified_at IS NULL AND u.kode_unit = ? LIMIT ? OFFSET ?`,
      [context.user.kode_unit, take, skip]
    );
    return { data: rows };
  },

  getProvinsi: async () => {
    const [rows] = await db.query("SELECT * FROM provinsi");
    return rows;
  },

  getKota: async (parent, { provinsiId }) => {
    const [rows] = await db.query("SELECT * FROM kota WHERE provinsi_id = ?", [
      provinsiId,
    ]);
    return rows;
  },

  getKategoriAcara: async () => {
    const [rows] = await db.query(
      "SELECT * FROM kategori_acara WHERE is_active = TRUE"
    );
    return rows;
  },

  // root mutation resolvers
  login: async (parent, { input }) => {
    const { username, password } = input;
    const [[user]] = await db.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);
    if (!user) throw new Error("Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        kode_unit: user.kode_unit,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    const { password: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  },

  createEventPermission: async (parent, { input }, context) => {
    if (!context.user || context.user.role !== "OPERATOR")
      throw new Error("Access denied. Operator role required.");
    if (input.nama_acara.length < 3)
      throw new Error("nama_acara minimal 3 karakter");
    if (input.lokasi.length < 10) throw new Error("lokasi minimal 10 karakter");

    const eventId = randomUUID();
    const fields = [
      "id",
      "nama_acara",
      "penyelenggara",
      "jumlah_peserta",
      "tanggal_mulai",
      "tanggal_selesai",
      "lokasi",
      "provinsi_id",
      "kota_id",
      "kategori_acara_id",
      "user_id",
    ];
    const values = [
      eventId,
      input.nama_acara,
      input.penyelenggara,
      input.jumlah_peserta,
      input.tanggal_mulai,
      input.tanggal_selesai,
      input.lokasi,
      input.provinsi_id,
      input.kota_id,
      input.kategori_acara_id,
      context.user.id,
    ];

    await db.query(
      `INSERT INTO event_permissions (${fields.join(", ")}) VALUES (${fields
        .map(() => "?")
        .join(", ")})`,
      values
    );
    const [[event]] = await db.query(
      "SELECT * FROM event_permissions WHERE id = ?",
      [eventId]
    );
    return event;
  },

  updateEventPermission: async (parent, { id, input }, context) => {
    if (!context.user || context.user.role !== "OPERATOR")
      throw new Error("Access denied. Operator role required.");
    const [[event]] = await db.query(
      "SELECT * FROM event_permissions WHERE id = ?",
      [id]
    );
    if (!event) throw new Error("Event permission not found");
    if (event.user_id !== context.user.id)
      throw new Error("You don't have access to this event permission");
    if (event.verified_at)
      throw new Error("Cannot modify verified event permission");

    await db.query(
      "UPDATE event_permissions SET nama_acara = ?, penyelenggara = ?, jumlah_peserta = ?, lokasi = ? WHERE id = ?",
      [
        input.nama_acara,
        input.penyelenggara,
        input.jumlah_peserta,
        input.lokasi,
        id,
      ]
    );
    const [[updatedEvent]] = await db.query(
      "SELECT * FROM event_permissions WHERE id = ?",
      [id]
    );
    return updatedEvent;
  },

  deleteEventPermission: async (parent, { id }, context) => {
    if (!context.user || context.user.role !== "OPERATOR")
      throw new Error("Access denied. Operator role required.");
    const [[event]] = await db.query(
      "SELECT * FROM event_permissions WHERE id = ?",
      [id]
    );
    if (!event) throw new Error("Event permission not found");
    if (event.user_id !== context.user.id)
      throw new Error("You don't have access to this event permission");
    if (event.verified_at)
      throw new Error("Cannot modify verified event permission");
    await db.query("DELETE FROM event_permissions WHERE id = ?", [id]);
    return true;
  },

  verifyEventPermission: async (parent, { id }, context) => {
    if (!context.user || context.user.role !== "VERIFIKATOR")
      throw new Error("Access denied. Verifikator role required.");
    const [[event]] = await db.query(
      "SELECT * FROM event_permissions WHERE id = ?",
      [id]
    );
    if (!event) throw new Error("Event permission not found");
    if (event.verified_at) throw new Error("Event permission already verified");
    const [[author]] = await db.query(
      "SELECT kode_unit FROM users WHERE id = ?",
      [event.user_id]
    );
    if (author.kode_unit !== context.user.kode_unit)
      throw new Error("Access denied. Different unit");
    await db.query(
      "UPDATE event_permissions SET verified_at = CURRENT_TIMESTAMP, verified_by = ? WHERE id = ?",
      [context.user.username, id]
    );
    const [[updatedEvent]] = await db.query(
      "SELECT * FROM event_permissions WHERE id = ?",
      [id]
    );
    return updatedEvent;
  },

  // untuk memasukkan data awal
  createUser: async (parent, { input }) => {
    const { username, password, role, kode_unit } = input;
    const id = `cuid_${username}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (id, username, password, role, kode_unit) VALUES (?, ?, ?, ?, ?)",
      [id, username, hashedPassword, role, kode_unit]
    );
    const [[user]] = await db.query(
      "SELECT id, username, role, kode_unit FROM users WHERE id = ?",
      [id]
    );
    return user;
  },

  createProvinsi: async (parent, { input }) => {
    const [result] = await db.query(
      "INSERT INTO provinsi (nama, kode) VALUES (?, ?)",
      [input.nama, input.kode]
    );
    const [[provinsi]] = await db.query("SELECT * FROM provinsi WHERE id = ?", [
      result.insertId,
    ]);
    return provinsi;
  },

  createKota: async (parent, { input }) => {
    const [result] = await db.query(
      "INSERT INTO kota (nama, kode, provinsi_id) VALUES (?, ?, ?)",
      [input.nama, input.kode, input.provinsi_id]
    );
    const [[kota]] = await db.query("SELECT * FROM kota WHERE id = ?", [
      result.insertId,
    ]);
    return kota;
  },

  createKategoriAcara: async (parent, { input }) => {
    const [result] = await db.query(
      "INSERT INTO kategori_acara (nama, kode, deskripsi) VALUES (?, ?, ?)",
      [input.nama, input.kode, input.deskripsi]
    );
    const [[kategori]] = await db.query(
      "SELECT * FROM kategori_acara WHERE id = ?",
      [result.insertId]
    );
    return kategori;
  },

  // resolver untuk relasi di EventPermission
  EventPermission: {
    author: async (parent) => {
      const [[user]] = await db.query(
        "SELECT id, username, role, kode_unit FROM users WHERE id = ?",
        [parent.user_id]
      );
      return user;
    },
    provinsi: async (parent) => {
      const [[provinsi]] = await db.query(
        "SELECT * FROM provinsi WHERE id = ?",
        [parent.provinsi_id]
      );
      return provinsi;
    },
    kota: async (parent) => {
      const [[kota]] = await db.query("SELECT * FROM kota WHERE id = ?", [
        parent.kota_id,
      ]);
      return kota;
    },
  },
};
