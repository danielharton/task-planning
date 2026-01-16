/**
 * Migration: Create metar_lookups table for storing airport weather lookups
 * Stores ICAO code, raw METAR data, and lookup metadata
 */

exports.up = function (knex) {
    return knex.schema.createTable('metar_lookups', function (table) {
        table.increments('id').primary();
        table.string('icao', 10).notNullable();
        table.text('raw_metar').nullable();
        table.json('parsed_data').nullable();
        table.integer('user_id').unsigned().notNullable()
            .references('id').inTable('users').onDelete('CASCADE');
        table.timestamp('lookup_time').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('metar_lookups');
};
