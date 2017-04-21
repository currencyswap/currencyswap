'use strict';
/**
 * @author Viet Nghiem
 */
module.exports = {
  'CSwapDB': {
    'name': 'CSwapDB',
    'connector': process.env.DATABASE_CONNECTOR || 'mysql',
    'host': process.env.DATABASE_HOST || '192.168.0.27',
    'port': process.env.DATABASE_PORT || 3306,
    'url': process.env.DATABASE_URL || '',
    'database': process.env.DATABASE_NAME || 'cs_demo',
    'user': process.env.DATABASE_USER || 'ubuntu',
    'password': process.env.DATABASE_PASSWORD || 'vsiics',
    'server': {
      'auto_reconnect': true,
      'reconnectTries': 100,
      'reconnectInterval': 1000
    }
  }
};
