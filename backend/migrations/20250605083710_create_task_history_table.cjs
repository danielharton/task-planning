/**
 * Migration: Create task_history table for tracking task state changes
 * Records all status transitions with actor and timestamp
 */

exports.up = function (knex) {
    return knex.schema.createTable('task_history', function (table) {
        table.increments('id').primary();
        table.integer('task_id').unsigned().notNullable()
            .references('id').inTable('tasks').onDelete('CASCADE');
        table.enu('previous_status', ['OPEN', 'PENDING', 'COMPLETED', 'CLOSED']).nullable();
        table.enu('new_status', ['OPEN', 'PENDING', 'COMPLETED', 'CLOSED']).notNullable();
        table.integer('actor_user_id').unsigned().notNullable()
            .references('id').inTable('users').onDelete('CASCADE');
        table.timestamp('timestamp').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('task_history');
};
