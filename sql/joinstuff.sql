SELECT * FROM employees.employee
INNER JOIN role ON employee.role_id = role.id
INNER JOIN department ON role.department_id = department.id;

INSERT INTO employee(first_name,last_name,role_id,manager_id) VALUES ("bobithy","billysons",1,3);
SELECT * FROM employees.employee

SELECT * FROM employees.role;
INSERT INTO role(title,salary,department_id) VALUES ("lead procrastinaton technician",4500.00,1)
