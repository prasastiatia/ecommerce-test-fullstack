import { Dialect } from "sequelize";

interface DBConfig {
  [env: string]: {
    username: string;
    password: string;
    database: string;
    host: string;
    dialect: Dialect;
  };
}

const config: DBConfig = {
  development: {
    username: "postgres",
    password: "your_password",
    database: "my_inventory_db",
    host: "127.0.0.1",
    dialect: "postgres",
  },
  test: {
    username: "postgres",
    password: "your_password",
    database: "my_inventory_test",
    host: "127.0.0.1",
    dialect: "postgres",
  },
  production: {
    username: "postgres",
    password: "your_password",
    database: "my_inventory_prod",
    host: "127.0.0.1",
    dialect: "postgres",
  },
};

module.exports = config;
