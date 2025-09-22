'use strict';
require('dotenv').config();
const mysql = require('mysql2');

const host = process.env.DB_HOST;
const user = process.env.DB_USER;
const pass = process.env.DB_PASS;
const port = process.env.DB_PORT;
const db = process.env.DB_DB;

let connection = null;

const connectToDatabase = () => {
  if(connection){
    return connection;
  }
  connection = mysql.createPool({
      host: host,
      port: port,
      user: user, // USER NAME
      database: db, // DATABASE NAME
      password: pass,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });

    // Check database connection
    connection.getConnection((err, connection) => {
      if (err) {
        console.error('Error connecting to database:', err);
        return;
      }
      console.log('Successfully connected to database');
      connection.release();
    });
    return connection;
};

module.exports = connectToDatabase();
