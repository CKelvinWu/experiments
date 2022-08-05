const mysql = require('mysql2/promise');

// connectLimit: 1
const config = {
  db: {
    host: 'localhost',
    user: '',
    password: '',
    database: 'test',
    waitForConnections: true,
    connectionLimit: 1,
    queueLimit: 0,
  },
};

const pool = mysql.createPool(config.db);

async function execute(sql, params) {
  // check array
  if (typeof params === 'object' && params[0]) {
    params = params.map((param) => String(param));
  }

  // check number
  if (typeof params === 'number') {
    params = String(params);
  }

  // check string
  if (typeof params === 'string') {
    params = [params];
  }

  const [results] = await pool.execute(sql, params);
  return results;
}

const db = { execute, pool };

const selectSql =
  "SELECT * FROM test.MOCK_DATA WHERE first_name='Adam' AND last_name='Sauter'";
const createIndex =
  'create index first_name_last_name on MOCK_DATA(first_name, last_name(3));';
const dropIndex = 'drop index first_name_last_name on MOCK_DATA;';

const getUsers = async () => {
  const sql = selectSql;
  const result = await db.execute(sql);
  return result;
};

const loopTimes = 200;

const warmup = async () => {
  console.time('warmup');
  for (let i = 0; i < 10; i++) {
    await getUsers();
  }
  console.timeEnd('warmup');
};

const speed = async () => {
  try {
    await db.execute(dropIndex);
    console.log('index dropped');
  } catch (error) {
    // console.log(error);
    console.log('index already drop');
  }
  console.time('without index');
  for (let i = 0; i < loopTimes; i++) {
    await getUsers();
  }
  console.timeEnd('without index');
};

const speedIndex = async () => {
  try {
    await db.execute(createIndex);
    console.log('index created');
  } catch (error) {
    // console.log(error);
    console.log('index already exist');
  }
  console.time('with index');
  for (let i = 0; i < loopTimes; i++) {
    await getUsers();
  }
  console.timeEnd('with index');
};

const run = async () => {
  await warmup();
  await speed();
  await speedIndex();
};
run();
