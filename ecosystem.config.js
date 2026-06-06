module.exports = {
    apps: [
        {
            name: "school-frontend",
            script: ".next/standalone/server.js",
            env: {
                PORT: 3000,
                NODE_ENV: "production"
            }
        }
    ]
}