import { DbItem } from '../models/core/db.item';
import * as config from './database.config.json';
require('dotenv').config();
var mysql = require('mysql');

var connection = mysql.createConnection({
  host     : process.env.MYSQL_HOST,
  user     : process.env.MYSQL_USER,
  password : process.env.MYSQL_PASSWORD,
  database : process.env.MYSQL_DATABASE
});
console.log("Connecting to mysql database...");
connection.connect();
console.log("Connecting to mysql database sucessfull!");

export async function query<T>(query: string): Promise<T[]> {
	if (config.log) {
		console.log(query);
	}
	return await connection.query(query);
}
export async function fetch<T>(table: string, filter: DbItem): Promise<T[]> {
	return query<T>('SELECT * FROM ' + table + ' WHERE ' + filter.whereString() + ';');
}
export async function fetchSimilar<T>(table: string, filter: DbItem): Promise<T[]> {
	return query<T>('SELECT * FROM ' + table + ' WHERE ' + filter.whereSimilarString() + ';');
}
export async function fetchAll<T>(table: string): Promise<T[]> {
	return query<T>('SELECT * FROM ' + table + ';');
}
export async function insert<T>(table: string, filter: DbItem): Promise<T[]> {
	return query<T>('INSERT INTO ' + table + ' (' + filter.listKeys() + ') VALUES (' + filter.listValues() + ');');
}
export async function update<T>(table: string, filter: DbItem): Promise<T[]> {
	return query<T>('UPDATE ' + table + ' SET ' + filter.valuesToString() + ' WHERE id=\'' + filter.id + '\';');
}
export async function deleteItem<T>(table: string, filter: DbItem): Promise<T[]> {
	return query<T>('DELETE FROM ' + table + ' WHERE \'' + filter.whereString() + '\';');
}
