/**
 * Migration: Create tasks table for Airport Task Planner
 * Task lifecycle: OPEN -> PENDING -> COMPLETED -> CLOSED
 */

exports.up = function (knex) {
    return knex.schema.createTable('tasks', function (table) {
        table.increments('id').primary();
        table.string('title', 255).notNullable();
        table.text('description').nullable();
        table.enu('status', ['OPEN', 'PENDING', 'COMPLETED', 'CLOSED']).notNullable().defaultTo('OPEN');
        table.integer('created_by_manager_id').unsigned().notNullable()
            .references('id').inTable('users').onDelete('CASCADE');
        table.integer('assigned_to_user_id').unsigned().nullable()
            .references('id').inTable('users').onDelete('SET NULL');
        table.timestamps(true, true);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('tasks');
};
