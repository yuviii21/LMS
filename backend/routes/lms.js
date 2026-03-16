const express = require('express');
const db = require('../db');
const { authenticateToken } = require('./auth');

const router = express.Router();

function mapDbError(error, fallbackMessage) {
    if (error && error.message === 'DATABASE_URL is not configured') {
        return {
            status: 500,
            payload: {
                error: 'DATABASE_URL is not configured on server',
                hint: 'Add DATABASE_URL in Vercel Environment Variables'
            }
        };
    }

    if (error && error.code === '42P01') {
        return {
            status: 500,
            payload: {
                error: 'Database tables are missing',
                hint: 'Open /api/init-db once to create required tables'
            }
        };
    }

    return {
        status: 500,
        payload: {
            error: fallbackMessage,
            details: error ? error.message : fallbackMessage
        }
    };
}

function toCourse(row) {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        category: row.category,
        instructor: row.instructor_name,
        thumbnailUrl: row.thumbnail_url,
        difficulty: row.difficulty,
        estimatedHours: Number(row.estimated_hours || 0),
        lessonCount: Number(row.lesson_count || 0)
    };
}

function toLesson(row) {
    return {
        id: row.id,
        title: row.title,
        order: Number(row.order_number),
        orderNumber: Number(row.order_number),
        youtubeVideoId: row.youtube_video_id,
        youtubeUrl: row.youtube_url,
        duration: row.duration,
        description: row.description
    };
}

async function getCourseProgress(userId, courseId) {
    const [totalsResult, completedResult, completedLessonsResult, lastWatchedResult] = await Promise.all([
        db.query('SELECT COUNT(*)::int AS total_lessons FROM lessons WHERE course_id = $1', [courseId]),
        db.query(
            "SELECT COUNT(*)::int AS completed_lessons FROM lesson_progress WHERE user_id = $1 AND course_id = $2 AND status = 'completed'",
            [userId, courseId]
        ),
        db.query(
            "SELECT lp.lesson_id FROM lesson_progress lp INNER JOIN lessons l ON l.id = lp.lesson_id WHERE lp.user_id = $1 AND lp.course_id = $2 AND lp.status = 'completed' ORDER BY l.order_number ASC",
            [userId, courseId]
        ),
        db.query(
            'SELECT lesson_id, last_position_seconds, last_watched_at FROM lesson_progress WHERE user_id = $1 AND course_id = $2 ORDER BY last_watched_at DESC LIMIT 1',
            [userId, courseId]
        )
    ]);

    const totalLessons = totalsResult.rows[0] ? Number(totalsResult.rows[0].total_lessons) : 0;
    const completedLessons = completedResult.rows[0] ? Number(completedResult.rows[0].completed_lessons) : 0;
    const percent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    const lastWatched = lastWatchedResult.rows[0] || null;

    return {
        courseId,
        totalLessons,
        completedLessons,
        percentComplete: percent,
        completedLessonIds: completedLessonsResult.rows.map((row) => row.lesson_id),
        lastWatchedLesson: lastWatched ? lastWatched.lesson_id : null,
        lastPositionSeconds: lastWatched ? Number(lastWatched.last_position_seconds || 0) : 0,
        lastAccessedAt: lastWatched ? lastWatched.last_watched_at : null
    };
}

async function upsertLessonProgress(userId, lessonId, payload = {}) {
    const lessonResult = await db.query(
        'SELECT id, course_id FROM lessons WHERE id = $1',
        [lessonId]
    );

    if (lessonResult.rows.length === 0) {
        return {
            status: 404,
            payload: { error: 'Lesson not found' }
        };
    }

    const lesson = lessonResult.rows[0];
    if (payload.courseId && payload.courseId !== lesson.course_id) {
        return {
            status: 400,
            payload: { error: 'courseId does not match lesson course' }
        };
    }

    const status = payload.status === 'completed' ? 'completed' : 'in_progress';
    const parsedPosition = Number(payload.lastPositionSeconds || 0);
    const lastPositionSeconds = Number.isFinite(parsedPosition)
        ? Math.max(0, Math.floor(parsedPosition))
        : 0;

    await db.query(
        `
        INSERT INTO lesson_progress (
            user_id,
            course_id,
            lesson_id,
            status,
            last_position_seconds,
            last_watched_at,
            completed_at,
            updated_at
        )
        VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            CURRENT_TIMESTAMP,
            CASE WHEN $4 = 'completed' THEN CURRENT_TIMESTAMP ELSE NULL END,
            CURRENT_TIMESTAMP
        )
        ON CONFLICT (user_id, lesson_id)
        DO UPDATE SET
            status = CASE
                WHEN lesson_progress.status = 'completed' OR EXCLUDED.status = 'completed' THEN 'completed'
                ELSE 'in_progress'
            END,
            last_position_seconds = GREATEST(0, EXCLUDED.last_position_seconds),
            last_watched_at = CURRENT_TIMESTAMP,
            completed_at = CASE
                WHEN lesson_progress.completed_at IS NOT NULL OR EXCLUDED.status = 'completed'
                    THEN COALESCE(lesson_progress.completed_at, CURRENT_TIMESTAMP)
                ELSE NULL
            END,
            updated_at = CURRENT_TIMESTAMP;
        `,
        [userId, lesson.course_id, lessonId, status, lastPositionSeconds]
    );

    const progress = await getCourseProgress(userId, lesson.course_id);
    return {
        status: 200,
        payload: {
            message: status === 'completed' ? 'Lesson marked as completed' : 'Lesson progress updated',
            lessonId,
            courseId: lesson.course_id,
            progress
        }
    };
}

router.get('/courses', async (req, res) => {
    try {
        const result = await db.query(
            `
            SELECT
                c.*,
                COUNT(l.id)::int AS lesson_count
            FROM courses c
            LEFT JOIN lessons l ON l.course_id = c.id
            GROUP BY c.id
            ORDER BY c.title ASC;
            `
        );

        res.json({ courses: result.rows.map(toCourse) });
    } catch (error) {
        const mapped = mapDbError(error, 'Failed to fetch courses');
        res.status(mapped.status).json(mapped.payload);
    }
});

router.get('/courses/:courseId', async (req, res) => {
    try {
        const { courseId } = req.params;
        const courseResult = await db.query('SELECT * FROM courses WHERE id = $1', [courseId]);
        if (courseResult.rows.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const lessonsResult = await db.query(
            'SELECT * FROM lessons WHERE course_id = $1 ORDER BY order_number ASC',
            [courseId]
        );

        res.json({
            course: {
                ...toCourse({ ...courseResult.rows[0], lesson_count: lessonsResult.rows.length }),
                playlist: lessonsResult.rows.map(toLesson)
            }
        });
    } catch (error) {
        const mapped = mapDbError(error, 'Failed to fetch course details');
        res.status(mapped.status).json(mapped.payload);
    }
});

router.get('/courses/:courseId/lessons', async (req, res) => {
    try {
        const { courseId } = req.params;
        const courseResult = await db.query('SELECT id, title FROM courses WHERE id = $1', [courseId]);
        if (courseResult.rows.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const lessonsResult = await db.query(
            'SELECT id, title, order_number, youtube_video_id, youtube_url, duration, description FROM lessons WHERE course_id = $1 ORDER BY order_number ASC',
            [courseId]
        );

        res.json({
            courseId,
            courseTitle: courseResult.rows[0].title,
            lessons: lessonsResult.rows.map(toLesson)
        });
    } catch (error) {
        const mapped = mapDbError(error, 'Failed to fetch course lessons');
        res.status(mapped.status).json(mapped.payload);
    }
});

router.get('/courses/:courseId/first-lesson', authenticateToken, async (req, res) => {
    try {
        const { courseId } = req.params;
        const lessonsResult = await db.query(
            `
            SELECT
                l.id,
                l.order_number,
                COALESCE(lp.status, 'not_started') AS status
            FROM lessons l
            LEFT JOIN lesson_progress lp
                ON lp.lesson_id = l.id
                AND lp.user_id = $1
            WHERE l.course_id = $2
            ORDER BY l.order_number ASC;
            `,
            [req.userId, courseId]
        );

        if (lessonsResult.rows.length === 0) {
            return res.status(404).json({ error: 'No lessons found for this course' });
        }

        const firstUncompleted = lessonsResult.rows.find((row) => row.status !== 'completed');
        const firstLesson = firstUncompleted || lessonsResult.rows[0];

        res.json({ courseId, lessonId: firstLesson.id });
    } catch (error) {
        const mapped = mapDbError(error, 'Failed to fetch first lesson');
        res.status(mapped.status).json(mapped.payload);
    }
});

router.get('/lessons/:lessonId/video', authenticateToken, async (req, res) => {
    try {
        const { lessonId } = req.params;
        const result = await db.query(
            'SELECT id, course_id, title, youtube_video_id, youtube_url FROM lessons WHERE id = $1',
            [lessonId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Lesson not found' });
        }

        const lesson = result.rows[0];
        res.json({
            lessonId: lesson.id,
            courseId: lesson.course_id,
            title: lesson.title,
            youtubeVideoId: lesson.youtube_video_id,
            youtubeUrl: lesson.youtube_url,
            embedUrl: `https://www.youtube.com/embed/${lesson.youtube_video_id}`
        });
    } catch (error) {
        const mapped = mapDbError(error, 'Failed to fetch lesson video URL');
        res.status(mapped.status).json(mapped.payload);
    }
});

router.post('/enrollments', authenticateToken, async (req, res) => {
    try {
        const { courseId } = req.body;
        if (!courseId) {
            return res.status(400).json({ error: 'courseId is required' });
        }

        const courseResult = await db.query('SELECT id FROM courses WHERE id = $1', [courseId]);
        if (courseResult.rows.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        await db.query(
            `
            INSERT INTO enrollments (user_id, course_id)
            VALUES ($1, $2)
            ON CONFLICT (user_id, course_id)
            DO NOTHING;
            `,
            [req.userId, courseId]
        );

        res.status(201).json({ message: 'Enrollment saved', courseId });
    } catch (error) {
        const mapped = mapDbError(error, 'Failed to enroll in course');
        res.status(mapped.status).json(mapped.payload);
    }
});

router.get('/enrollments/me', authenticateToken, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT course_id, enrolled_at FROM enrollments WHERE user_id = $1 ORDER BY enrolled_at DESC',
            [req.userId]
        );

        const enrollments = {};
        result.rows.forEach((row) => {
            enrollments[row.course_id] = true;
        });

        res.json({
            courseIds: result.rows.map((row) => row.course_id),
            enrollments
        });
    } catch (error) {
        const mapped = mapDbError(error, 'Failed to fetch enrollments');
        res.status(mapped.status).json(mapped.payload);
    }
});

router.get('/progress/courses/:courseId', authenticateToken, async (req, res) => {
    try {
        const { courseId } = req.params;
        const courseResult = await db.query('SELECT id FROM courses WHERE id = $1', [courseId]);
        if (courseResult.rows.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const progress = await getCourseProgress(req.userId, courseId);
        res.json(progress);
    } catch (error) {
        const mapped = mapDbError(error, 'Failed to fetch course progress');
        res.status(mapped.status).json(mapped.payload);
    }
});

router.post('/progress/lessons/:lessonId', authenticateToken, async (req, res) => {
    try {
        const result = await upsertLessonProgress(req.userId, req.params.lessonId, req.body || {});
        res.status(result.status).json(result.payload);
    } catch (error) {
        const mapped = mapDbError(error, 'Failed to update lesson progress');
        res.status(mapped.status).json(mapped.payload);
    }
});

router.post('/progress/lessons/:lessonId/complete', authenticateToken, async (req, res) => {
    try {
        const result = await upsertLessonProgress(req.userId, req.params.lessonId, {
            ...(req.body || {}),
            status: 'completed'
        });
        res.status(result.status).json(result.payload);
    } catch (error) {
        const mapped = mapDbError(error, 'Failed to mark lesson as completed');
        res.status(mapped.status).json(mapped.payload);
    }
});

router.get('/learning/state', authenticateToken, async (req, res) => {
    try {
        const [enrollmentResult, progressResult] = await Promise.all([
            db.query('SELECT course_id FROM enrollments WHERE user_id = $1', [req.userId]),
            db.query(
                `
                SELECT
                    lp.course_id,
                    lp.lesson_id,
                    lp.status,
                    lp.last_watched_at,
                    l.order_number
                FROM lesson_progress lp
                INNER JOIN lessons l ON l.id = lp.lesson_id
                WHERE lp.user_id = $1
                ORDER BY lp.course_id, l.order_number ASC;
                `,
                [req.userId]
            )
        ]);

        const enrollments = {};
        enrollmentResult.rows.forEach((row) => {
            enrollments[row.course_id] = true;
        });

        const progress = {};
        progressResult.rows.forEach((row) => {
            if (!progress[row.course_id]) {
                progress[row.course_id] = {
                    completedLessons: [],
                    lastWatchedLesson: null,
                    lastAccessedAt: null
                };
            }

            if (row.status === 'completed') {
                progress[row.course_id].completedLessons.push(row.lesson_id);
            }

            const existingTimestamp = progress[row.course_id].lastAccessedAt
                ? new Date(progress[row.course_id].lastAccessedAt).getTime()
                : 0;
            const candidateTimestamp = row.last_watched_at
                ? new Date(row.last_watched_at).getTime()
                : 0;

            if (candidateTimestamp >= existingTimestamp) {
                progress[row.course_id].lastAccessedAt = row.last_watched_at;
                progress[row.course_id].lastWatchedLesson = row.lesson_id;
            }
        });

        res.json({ enrollments, progress });
    } catch (error) {
        const mapped = mapDbError(error, 'Failed to fetch learning state');
        res.status(mapped.status).json(mapped.payload);
    }
});

module.exports = { router };
