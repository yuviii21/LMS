const COURSE_SEED = [
    {
        id: 'c1',
        title: 'JavaScript Full Course',
        description: 'Master JavaScript from scratch with this comprehensive course.',
        category: 'Web Dev',
        instructor: 'John Doe',
        thumbnailUrl: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&q=80&w=800',
        difficulty: 'Beginner',
        estimatedHours: 8,
        tags: ['JavaScript', 'Web', 'Programming'],
        playlist: [
            { id: 'l1', title: 'JavaScript Fundamentals', youtubeVideoId: 'W6NZfCO5SIk', duration: '1:15:00', description: 'Basic syntax, variables, and data types.' },
            { id: 'l2', title: 'Functions and Scope', youtubeVideoId: 'N8ap4k_1QEQ', duration: '45:00', description: 'Deep dive into functions, scope, and closures.' },
            { id: 'l3', title: 'DOM Manipulation', youtubeVideoId: 'y17RuWUpzO8', duration: '50:00', description: 'How to interact with HTML elements using JS.' },
            { id: 'l4', title: 'Async JS and APIs', youtubeVideoId: 'ZYb_ZU8LNxs', duration: '1:05:00', description: 'Promises, Async/Await, and Fetch API.' }
        ]
    },
    {
        id: 'c2',
        title: 'Python for Beginners',
        description: 'Start your programming journey with Python.',
        category: 'Data Science',
        instructor: 'Jane Smith',
        thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800',
        difficulty: 'Beginner',
        estimatedHours: 6,
        tags: ['Python', 'Beginner', 'Backend'],
        playlist: [
            { id: 'l5', title: 'Python Basics', youtubeVideoId: 'kqtD5dpn9C8', duration: '1:00:00', description: 'Getting started with Python syntax.' },
            { id: 'l6', title: 'Data Structures', youtubeVideoId: 'R-HLU9Fl5ug', duration: '45:00', description: 'Lists, Dictionaries, Sets, and Tuples.' },
            { id: 'l7', title: 'Control Flow', youtubeVideoId: 'PqFKRqpHrjw', duration: '40:00', description: 'If statements and loops.' }
        ]
    },
    {
        id: 'c3',
        title: 'React Masterclass',
        description: 'Build modern user interfaces with React.',
        category: 'Web Dev',
        instructor: 'Alex Johnson',
        thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=800',
        difficulty: 'Intermediate',
        estimatedHours: 10,
        tags: ['React', 'Frontend', 'JavaScript'],
        playlist: [
            { id: 'l8', title: 'React Crash Course', youtubeVideoId: 'w7ejDZ8SWv8', duration: '1:30:00', description: 'Components, Props, and State.' },
            { id: 'l9', title: 'Hooks in Depth', youtubeVideoId: 'O6P86uwfdR0', duration: '1:10:00', description: 'useState, useEffect, and custom hooks.' },
            { id: 'l10', title: 'Context API', youtubeVideoId: '5LrDIWkK_Bc', duration: '55:00', description: 'State management with Context.' }
        ]
    },
    {
        id: 'c4',
        title: 'Data Structures and Algorithms',
        description: 'Master CS fundamentals and ace your interviews.',
        category: 'Computer Science',
        instructor: 'Sarah Lee',
        thumbnailUrl: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&q=80&w=800',
        difficulty: 'Advanced',
        estimatedHours: 12,
        tags: ['DSA', 'Algorithms', 'Interviews'],
        playlist: [
            { id: 'l11', title: 'Big O Notation', youtubeVideoId: 'Mo4gwBdQjC8', duration: '40:00', description: 'Understanding time and space complexity.' },
            { id: 'l12', title: 'Arrays and Linked Lists', youtubeVideoId: 'WwfhLC16bis', duration: '1:20:00', description: 'Fundamental data structures.' },
            { id: 'l13', title: 'Trees and Graphs', youtubeVideoId: 'tWVWeAqZ0WU', duration: '1:50:00', description: 'Advanced non-linear structures.' }
        ]
    },
    {
        id: 'c5',
        title: 'Node.js and Express Backend',
        description: 'Build scalable server-side applications with Node.js.',
        category: 'Backend',
        instructor: 'Mike Chen',
        thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
        difficulty: 'Intermediate',
        estimatedHours: 9,
        tags: ['Node.js', 'Express', 'Backend', 'JavaScript'],
        playlist: [
            { id: 'l14', title: 'Node.js Fundamentals', youtubeVideoId: 'TlB_eWDSMt4', duration: '1:10:00', description: 'Introduction to Node.js runtime.' },
            { id: 'l15', title: 'Express Server Setup', youtubeVideoId: 'L8zBMdZ1vNE', duration: '55:00', description: 'Building REST APIs with Express.' },
            { id: 'l16', title: 'Database Integration', youtubeVideoId: 'RmfSMo01022', duration: '1:00:00', description: 'Connecting to MongoDB and databases.' }
        ]
    },
    {
        id: 'c6',
        title: 'Mobile App Development with React Native',
        description: 'Create cross-platform mobile apps using React Native.',
        category: 'Mobile Dev',
        instructor: 'Emma Wilson',
        thumbnailUrl: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?auto=format&fit=crop&q=80&w=800',
        difficulty: 'Intermediate',
        estimatedHours: 11,
        tags: ['React Native', 'Mobile', 'iOS', 'Android'],
        playlist: [
            { id: 'l17', title: 'React Native Setup', youtubeVideoId: 'ur6I5GQvWQA', duration: '50:00', description: 'Environment setup and first app.' },
            { id: 'l18', title: 'Native Components', youtubeVideoId: 'aYzsgNGiXLs', duration: '1:15:00', description: 'UI components and navigation.' },
            { id: 'l19', title: 'State Management', youtubeVideoId: 'N6xYGSP7bfE', duration: '1:00:00', description: 'Redux and Context API.' }
        ]
    },
    {
        id: 'c7',
        title: 'SQL Database Design',
        description: 'Master relational databases and SQL queries.',
        category: 'Database',
        instructor: 'David Kumar',
        thumbnailUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&q=80&w=800',
        difficulty: 'Beginner',
        estimatedHours: 7,
        tags: ['SQL', 'Database', 'MySQL', 'PostgreSQL'],
        playlist: [
            { id: 'l20', title: 'Database Basics', youtubeVideoId: 'OqNjLRYi0d8', duration: '45:00', description: 'Relational database concepts.' },
            { id: 'l21', title: 'SQL Queries', youtubeVideoId: '7S_tz1Z_5bA', duration: '1:20:00', description: 'SELECT, INSERT, UPDATE, DELETE operations.' },
            { id: 'l22', title: 'Joins and Indexing', youtubeVideoId: '2g2J_5H5s2U', duration: '1:05:00', description: 'Advanced querying and optimization.' }
        ]
    },
    {
        id: 'c8',
        title: 'Cloud Computing with AWS',
        description: 'Deploy and manage applications on AWS cloud platform.',
        category: 'Cloud',
        instructor: 'Lisa Anderson',
        thumbnailUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800',
        difficulty: 'Advanced',
        estimatedHours: 10,
        tags: ['AWS', 'Cloud', 'DevOps', 'EC2'],
        playlist: [
            { id: 'l23', title: 'AWS Essentials', youtubeVideoId: 'Ia-UEYYR44s', duration: '1:00:00', description: 'AWS core services overview.' },
            { id: 'l24', title: 'EC2 and S3', youtubeVideoId: 'I1IA3S8wkSU', duration: '1:15:00', description: 'Compute and storage services.' },
            { id: 'l25', title: 'Deployment and Scaling', youtubeVideoId: 'XZN_IBFRqCY', duration: '1:10:00', description: 'Auto-scaling and load balancing.' }
        ]
    }
];

module.exports = { COURSE_SEED };
