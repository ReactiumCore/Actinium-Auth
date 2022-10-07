const path = require("path");
const fs = require("fs-extra");
const express = require("express");

const MW = Actinium => {
  Actinium.Middleware.register(
    "auth",
    app => {
      const router = express.Router();
      const STATIC_PATH = path.normalize(`${__dirname}/public`);

      fs.ensureDirSync(STATIC_PATH);

      router.use("/api/auth", express.static(STATIC_PATH));

      app.use(router);

      return Promise.resolve();
    },
    -1000
  );
}

module.exports = Actinium ? MW(Actinium) : MW;
