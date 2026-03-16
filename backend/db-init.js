const { pool } = require('./db');
const { COURSE_SEED } = require('./data/courseSeed');

async function createSchema(client) {
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    await client.query(`
        CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(20) NOT NULL DEFAULT 'student',
            bio TEXT DEFAULT 'Passionate learner',
            avatar VARCHAR(255) DEFAULT '👨‍💻',
            enrolled_courses JSONB DEFAULT '[]'::jsonb,
            progress JSONB DEFAULT '{}'::jsonb,
            join_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `);

    await client.query(`
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'student';
    `);

    await client.query(`
        CREATE TABLE IF NOT EXISTS courses (
            id VARCHAR(50) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            thumbnail_url TEXT,
            category VARCHAR(100),
            instructor_name VARCHAR(255) NOT NULL,
            difficulty VARCHAR(50),
            estimated_hours INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `);

    await client.query(`
        CREATE TABLE IF NOT EXISTS sections (
            id VARCHAR(80) PRIMARY KEY,
            course_id VARCHAR(50) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
            title VARCHAR(255) NOT NULL,
            order_number INTEGER NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (course_id, order_number)
        );
    `);

    await client.query(`
        CREATE TABLE IF NOT EXISTS lessons (
            id VARCHAR(80) PRIMARY KEY,
            course_id VARCHAR(50) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
            section_id VARCHAR(80) NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            order_number INTEGER NOT NULL,
            youtube_video_id VARCHAR(50) NOT NULL,
            youtube_url TEXT NOT NULL,
            duration VARCHAR(30),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (course_id, section_id, order_number)
        );
    `);

    await client.query(`
        CREATE TABLE IF NOT EXISTS enrollments (
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            course_id VARCHAR(50) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
            enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id, course_id)
        );
    `);

    await client.query(`
        CREATE TABLE IF NOT EXISTS lesson_progress (
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            course_id VARCHAR(50) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
            lesson_id VARCHAR(80) NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
            status VARCHAR(30) NOT NULL DEFAULT 'in_progress',
            last_position_seconds INTEGER NOT NULL DEFAULT 0,
            last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            completed_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id, lesson_id),
            CONSTRAINT lesson_progress_status_check CHECK (status IN ('in_progress', 'completed'))
        );
    `);

    await client.query('CREATE INDEX IF NOT EXISTS idx_lessons_course_order ON lessons(course_id, order_number);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_sections_course_order ON sections(course_id, order_number);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_progress_user_course ON lesson_progress(user_id, course_id);');
}

async function seedCourses(client) {
    for (const course of COURSE_SEED) {
        await client.query(
            `
            INSERT INTO courses (
                id, title, description, thumbnail_url, category, instructor_name, difficulty, estimated_hours, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
            ON CONFLICT (id)
            DO UPDATE SET
                title = EXCLUDED.title,
                description = EXCLUDED.description,
                thumbnail_url = EXCLUDED.thumbnail_url,
                category = EXCLUDED.category,
                instructor_name = EXCLUDED.instructor_name,
                difficulty = EXCLUDED.difficulty,
                estimated_hours = EXCLUDED.estimated_hours,
                updated_at = CURRENT_TIMESTAMP;
            `,
            [
                course.id,
                course.title,
                course.description,
                course.thumbnailUrl,
                course.category,
                course.instructor,
                course.difficulty,
                course.estimatedHours
            ]
        );

        const sectionId = `${course.id}-s1`;
        await client.query(
            `
            INSERT INTO sections (id, course_id, title, order_number, updated_at)
            VALUES ($1, $2, $3, 1, CURRENT_TIMESTAMP)
            ON CONFLICT (id)
            DO UPDATE SET
                title = EXCLUDED.title,
                order_number = EXCLUDED.order_number,
                updated_at = CURRENT_TIMESTAMP;
            `,
            [sectionId, course.id, 'Main Content']
        );

        for (let index = 0; index < course.playlist.length; index += 1) {
            const lesson = course.playlist[index];
            const orderNumber = index + 1;
            const youtubeUrl = `https://www.youtube.com/watch?v=${lesson.youtubeVideoId}`;

            await client.query(
                `
                INSERT INTO lessons (
                    id, course_id, section_id, title, description, order_number, youtube_video_id, youtube_url, duration, updated_at
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
                ON CONFLICT (id)
                DO UPDATE SET
                    course_id = EXCLUDED.course_id,
                    section_id = EXCLUDED.section_id,
                    title = EXCLUDED.title,
                    description = EXCLUDED.description,
                    order_number = EXCLUDED.order_number,
                    youtube_video_id = EXCLUDED.youtube_video_id,
                    youtube_url = EXCLUDED.youtube_url,
                    duration = EXCLUDED.duration,
                    updated_at = CURRENT_TIMESTAMP;
                `,
                [
                    lesson.id,
                    course.id,
                    sectionId,
                    lesson.title,
                    lesson.description,
                    orderNumber,
                    lesson.youtubeVideoId,
                    youtubeUrl,
                    lesson.duration
                ]
            );
        }
    }
}

async function initializeDatabase() {
    if (!pool) {
        throw new Error('DATABASE_URL is not configured');
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await createSchema(client);
        await seedCourses(client);
        await client.query('COMMIT');

        return {
            seededCourses: COURSE_SEED.length,
            seededLessons: COURSE_SEED.reduce((count, course) => count + course.playlist.length, 0)
        };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

module.exports = { initializeDatabase };
