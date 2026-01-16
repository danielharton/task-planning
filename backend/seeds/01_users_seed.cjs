/**
 * Seed: Default users for Airport Task Planner
 * 
 * Default credentials:
 * - Admin: admin@airport.local / Admin123!
 * - Manager: manager@airport.local / Manager123!
 * - Executor: exec@airport.local / Exec123!
 * 
 * Passwords are hashed using MD5(password + password) for compatibility
 */

const crypto = require('crypto');

/**
 * Hash password using MD5 (password + password)
 * @param {string} password - Plain text password
 * @returns {string} - MD5 hashed password
 */
function md5Hash(password) {
    return crypto.createHash('md5').update(password + password).digest('hex');
}

exports.seed = async function (knex) {
    // Idempotent seed: only insert default accounts if missing.
    const defaultUsers = [
        {
            name: 'Administrator',
            email: 'admin@airport.local',
            password: md5Hash('Admin123!'),
            role: 'ADMIN',
            manager_id: null
        },
        {
            name: 'Operations Manager',
            email: 'manager@airport.local',
            password: md5Hash('Manager123!'),
            role: 'MANAGER',
            manager_id: null
        }
    ];

    const executorUser = {
        name: 'Ground Staff',
        email: 'exec@airport.local',
        password: md5Hash('Exec123!'),
        role: 'EXECUTOR'
    };

    const existing = await knex('users')
        .select('id', 'email')
        .whereIn('email', [
            'admin@airport.local',
            'manager@airport.local',
            'exec@airport.local'
        ]);

    const byEmail = new Map(existing.map(user => [user.email, user]));

    const insertedIds = [];

    for (const user of defaultUsers) {
        if (!byEmail.has(user.email)) {
            const [created] = await knex('users')
                .insert(user)
                .returning(['id', 'email']);
            byEmail.set(created.email, created);
            insertedIds.push(created.id);
        }
    }

    if (!byEmail.has(executorUser.email)) {
        const manager = byEmail.get('manager@airport.local');
        if (manager) {
            const [created] = await knex('users')
                .insert({ ...executorUser, manager_id: manager.id })
                .returning(['id', 'email']);
            byEmail.set(created.email, created);
            insertedIds.push(created.id);
        }
    }

    if (insertedIds.length > 0) {
        // Reset the sequence to start from the next available ID (PostgreSQL)
        await knex.raw("SELECT setval('users_id_seq', (SELECT MAX(id) FROM users))");
    }
};
