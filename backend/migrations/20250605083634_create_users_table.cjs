/**
 * Migration: Create users table for Airport Task Planner
 * Users can have roles: ADMIN, MANAGER, EXECUTOR
 * Executors must have a manager_id assigned
 */

exports.up = function (knex) {
    return knex.schema.createTable('users', function (table) {
        table.increments('id').primary();
        table.string('name', 255).notNullable();
        table.string('email', 255).notNullable().unique();
        table.string('password', 255).notNullable();
        table.enu('role', ['ADMIN', 'MANAGER', 'EXECUTOR']).notNullable().defaultTo('EXECUTOR');
        table.integer('manager_id').unsigned().nullable()
            .references('id').inTable('users').onDelete('SET NULL');
        table.integer('last_login').nullable();
        table.timestamps(true, true);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('users');
};
