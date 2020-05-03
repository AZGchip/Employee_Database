CREATE DATABASE employees
USE employees;
CREATE TABLE employee
(
employee_id INT PRIMARY KEY,
first_name VARCHAR(30) ,
last_name VARCHAR(30) ,
role_id INT ,
manager_id INT 
);
CREATE TABLE role
(
role_id INT PRIMARY KEY,
title VARCHAR(30),
salary DECIMAL,
department_id INT
);
CREATE TABLE department
(
department_id INT PRIMARY KEY,
name VARCHAR(30)
)