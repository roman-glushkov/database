-- 3.1 INSERT
-- a. Без указания списка полей
INSERT INTO
  specifications
VALUES
  (
    NULL,
    'Шина памяти',
    '192',
    'бит',
    'Основные параметры'
  );


-- b. С указанием списка полей
INSERT INTO
  specifications (spec_name, spec_value, spec_unit, spec_group)
VALUES
  (
    'Тип видеопамяти',
    'GDDR7',
    NULL,
    'Основные параметры'
  );


-- c. С чтением значения из другой таблицы
INSERT INTO
  component (NAME, TYPE, manufacturer, release_year)
SELECT
  spec_value,
  'Видеокарта',
  'Китай',
  2025
FROM
  specifications
WHERE
  spec_name = 'Графический процессор';


-- 3.2 DELETE
-- a. Всех записей
DELETE FROM specifications;


-- b. По условию
DELETE FROM specifications
WHERE
  spec_name = 'Шина памяти';


-- 3.3 UPDATE
-- a. Всех записей
UPDATE specifications
SET
  spec_group = 'Технические характеристики';


-- b. По условию обновляя один атрибут
UPDATE specifications
SET
  spec_value = '256'
WHERE
  spec_name = 'Шина памяти'
  AND spec_value = '192';


-- c. По условию обновляя несколько атрибутов
UPDATE specifications
SET
  spec_value = '192',
  spec_group = 'Основные параметры'
WHERE
  spec_name = 'Шина памяти'
  AND spec_value = '256';


-- 3.4 SELECT
-- a. С набором извлекаемых атрибутов
SELECT
  spec_name,
  spec_group
FROM
  specifications;


-- b. Со всеми атрибутами
SELECT
  *
FROM
  specifications;


-- c. С условием по атрибуту
SELECT
  *
FROM
  specifications
WHERE
  spec_group = 'Основные параметры';


-- 3.5 SELECT ORDER BY + LIMIT
-- a. С сортировкой по возрастанию ASC + ограничение вывода количества записей
SELECT
  *
FROM
  specifications
ORDER BY
  spec_name ASC
LIMIT
  3;


-- b. С сортировкой по убыванию DESC
SELECT
  *
FROM
  specifications
ORDER BY
  spec_name DESC;


-- c. С сортировкой по двум атрибутам + ограничение вывода количества записей
SELECT
  *
FROM
  specifications
ORDER BY
  spec_group ASC,
  spec_name ASC
LIMIT
  5;


-- d. С сортировкой по первому атрибуту, из списка извлекаемых
SELECT
  spec_name,
  spec_value,
  spec_unit
FROM
  specifications
ORDER BY
  spec_name;


-- 3.6 Работа с датами
-- a. WHERE по дате
SELECT
  *
FROM
  supply
WHERE
  DATE(supply_date) = '2025-01-15';


-- b. WHERE дата в диапазоне
SELECT
  *
FROM
  supply
WHERE
  supply_date BETWEEN '2026-01-01' AND '2026-06-30';


-- c. Извлечь из таблицы не всю дату, а только год
SELECT
  supplier_id,
  component_id,
  quantity,
  YEAR(supply_date) AS год
FROM
  supply;


-- 3.7 Функции агрегации
-- a. Посчитать количество записей в таблице
SELECT
  COUNT(*) AS всего_характеристик
FROM
  specifications;


-- b. Посчитать количество уникальных записей в таблице
SELECT
  COUNT(DISTINCT spec_name) AS уникальных_названий
FROM
  specifications;


-- c. Вывести уникальные значения столбца
SELECT DISTINCT
  spec_group
FROM
  specifications;


-- d. Найти максимальное значение столбца
SELECT
  MAX(quantity) AS максимальная_поставка
FROM
  supply;


-- e. Найти минимальное значение столбца
SELECT
  MIN(quantity) AS минимальная_поставка
FROM
  supply;


-- f. Написать запрос COUNT() + GROUP BY
SELECT
  YEAR(supply_date) AS год,
  COUNT(*) AS количество_поставок
FROM
  supply
GROUP BY
  YEAR(supply_date);


-- 3.8 SELECT GROUP BY + HAVING
-- Найти поставщиков, у которых суммарное количество поставленных компонентов превышает 300
SELECT
  supplier_id,
  SUM(quantity) AS всего_поставлено
FROM
  supply
GROUP BY
  supplier_id
HAVING
  SUM(quantity) > 300;

-- Найти группы характеристик, в которых больше 3 характеристик
SELECT
  spec_group,
  COUNT(*) AS количество_характеристик
FROM
  specifications
GROUP BY
  spec_group
HAVING
  COUNT(*) > 3;

-- Найти компоненты, которые используются в компьютерах более 1 раза
SELECT
  component_id,
  SUM(quantity) AS общее_количество
FROM
  configuration
GROUP BY
  component_id
HAVING
  SUM(quantity) > 1;

-- 3.9. SELECT JOIN
-- a. LEFT JOIN двух таблиц и WHERE по одному из атрибутов
SELECT 
    s.company_name AS supplier_name,
    s.contact_person,
    s.phone AS supplier_phone,
    sp.quantity AS supply_quantity 
FROM 
    supplier s
LEFT JOIN 
    supply sp ON s.supplier_id = sp.supplier_id
WHERE 
    s.company_name LIKE '%Inc%';

-- b. RIGHT JOIN. Получить такую же выборку, как и в 3.9 a
SELECT 
    s.company_name AS supplier_name,
    s.contact_person,
    s.phone AS supplier_phone,
    sp.quantity AS supply_quantity 
FROM 
    supply sp
RIGHT JOIN 
    supplier s ON sp.supplier_id = s.supplier_id
WHERE 
    s.company_name LIKE '%Inc%';

-- c. LEFT JOIN трех таблиц + WHERE по атрибуту из каждой таблицы
SELECT 
    s.company_name AS supplier_name,
    s.contact_person,
    c.name AS component_name,
    c.type AS component_type,
    sp.quantity AS supply_quantity,
    sp.supply_date
FROM 
    supplier s
LEFT JOIN 
    supply sp ON s.supplier_id = sp.supplier_id
LEFT JOIN 
    component c ON sp.component_id = c.component_id
WHERE 
    s.company_name LIKE '%Inc%'
    AND sp.quantity > 50
    AND c.type = 'Видеокарта';      

-- d. INNER JOIN двух таблиц
SELECT 
    s.company_name AS supplier_name,
    s.contact_person,
    s.phone AS supplier_phone,
    sp.component_id,
    sp.quantity AS supply_quantity,
    sp.supply_date
FROM 
    supplier s
INNER JOIN 
    supply sp ON s.supplier_id = sp.supplier_id
WHERE 
    s.company_name LIKE '%Inc%';    

-- 3.10. Подзапросы
-- a. Написать запрос с условием WHERE IN (подзапрос)
SELECT 
    company_name,
    contact_person,
    phone
FROM 
    supplier
WHERE 
    supplier_id IN (
        SELECT supplier_id
        FROM supply
    );

-- b. Написать запрос SELECT atr1, atr2, (подзапрос) FROM ...
SELECT 
    company_name,
    contact_person,
    (
        SELECT COUNT(*)
        FROM supply
        WHERE supplier_id = supplier.supplier_id
    ) AS supply_count
FROM 
    supplier;

-- c. Написать запрос вида SELECT * FROM (подзапрос)
SELECT * 
FROM (
    SELECT 
        company_name,
        contact_person,
        phone
    FROM 
        supplier
    WHERE 
        supplier_id < 3
) AS filtered_suppliers;

-- d. Написать запрос вида SELECT * FROM table JOIN (подзапрос) ON …
SELECT 
    s.company_name,
    s.contact_person,
    last_sp.component_id,
    last_sp.quantity,
    last_sp.supply_date
FROM 
    supplier s
JOIN (
    SELECT 
        supplier_id,
        component_id,
        quantity,
        supply_date
    FROM 
        supply
    WHERE 
        supply_date >= '2026-01-01'
) AS last_sp ON s.supplier_id = last_sp.supplier_id;