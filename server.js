import express from "express";
import pg from "pg";

const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/acme_hr_directory_db"
);
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
//api routes here ----------- 
//get departments
app.get(`/api/departments`, async (req, res, next) => {
    try {
        const SQL = `
          select * from departments;
        `;
        const response = await client.query(SQL);
        res.send(response.rows);
    } catch (ex) {
        next(ex);
    }
});
//get employees
app.get(`/api/employees`, async (req, res, next) => {
    try {
        const SQL = `
          select * from employees;
        `;
        const response = await client.query(SQL);
        res.send(response.rows);
    } catch (ex) {
        next(ex);
    }
});
//post a department
app.post('/api/departments', async (req, res, next) => {
    try {
        const SQL = `
          insert into departments(name) 
          values ($1)
          returning *
        `;
    } catch (ex) {
        next(ex);
    }
});
//post an employee
app.post(`/api/employees`, async (req, res, next) => {
    try {
        const SQL = `
          insert into employees(name, department_id) 
          values ($1, $2) 
          returning *
        `;
        const response = await client.query(SQL, [
            req.body.name,
            req.body.department_id
        ])
        res.send(response.rows[0]);
    } catch (ex) {
        next(ex);
    }
});
//put update an employee
app.put(`/api/employees/:id`, async (req, res, next) => {
    try {
        const SQL = `
            update employees
            set name=$1, department_id=$2, updated_at=now()
            where id=$3 returning *
        `;
        const response = await client.query(SQL, [
            req.body.name,
            req.body.department_id,
            req.params.id
        ]);
        res.send(response.rows[0]);
    } catch (ex) {
        next(ex);
    }
});
// delete some employees
app.delete(`/api/employees/:id`, async (req, res, next) => {
    try {
        const SQL = `
          delete from employees where id=$1;
        `;
        const response = await client.query(SQL, [req.params.id]);
        res.sendStatus(204);
    } catch (ex) {
        next(ex);
    }
});
async function init() {
  await client.connect();
  console.log("connected to database");
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
          department_id integer references departments(id) not null
        );
    `;
    await client.query(SQL);
  console.log(`tables created`);
  SQL = `
      insert into departments(name) values('Holders of Esoteric Knowledge');
      insert into departments(name) values('Cool Guy Department');
      insert into departments(name) values('Rad Fella Group');
      insert into employees(name, department_id) values('Wolfy', (select id from departments where name='Holders of Esoteric Knowledge'));
      insert into employees(name, department_id) values('Ryan Peterson', (select id from departments where name='Cool Guy Department'));
      insert into employees(name, department_id) values('Karl', (select id from departments where name='Rad Fella Group'));
    `;
  await client.query(SQL);
  console.log("data seeded");

  app.listen(port, () => console.log(`listening on port ${port}`));
};
init();
