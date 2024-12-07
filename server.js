const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_hr_directory_db');
async function init() {
    await client.connect();
    let SQL = `
        drop table if exists employees;
        drop table if exists departments;
        create table departments(
          id serial primary key,
          name varchar(50) not null
        );
        create table employees(
          id serial primary key,
          name varchar(50) not null,
          created_at timestamp default now(),
          updated_at timestamp default now(),
          department_id integer reference department(id) not null,
        );
    `;
    await client.query(SQL);
    console.log(`tables created`);
    SQL = `
      insert into departments(name) values(Holders of Esoteric Knowledge);
      insert into departments(name) values(Cool Guy Department);
      insert into departments(name) values(Rad Fella Group);
      insert into employees(name, department_id) values(Wolfy, (select id from departments(id) where name='Holders of Esoteric Knowledge'));
      insert into employees(name, department_id) values(Ryan Peterson, (select id from departments(id) where name='Cool Guy Department'));
      insert into employees(name, department_id) values(Karl, (select id from departments(id) where name='Rad Fella Group'));
    `;
    await client.query(SQL);
    console.log('data seeded');
}
init();