module.exports = {
  apps : [{
    name   : "instance3001",
    script : "./server.js",
    env_production: {
       NODE_ENV: "production",
       PORT: 3001
    },
    env_development: {
       NODE_ENV: "development",
       PORT: 3001
    }
  },   {
    name   : "instance3002",
    script : "./server.js",
    env_production: {
       NODE_ENV: "production",
       PORT: 3002
    },
    env_development: {
       NODE_ENV: "development",
       PORT: 3002
    }
  }
 ]
}