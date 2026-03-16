const { initializeDatabase } = require('./db-init');

initializeDatabase()
    .then((result) => {
        console.log(`Database initialized. Seeded ${result.seededCourses} courses and ${result.seededLessons} lessons.`);
        process.exit(0);
    })
    .catch((err) => {
        console.error('Initialization failed', err);
        process.exit(1);
    });
