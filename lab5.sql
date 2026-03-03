-- 1 Добавить внешние ключи
ALTER TABLE dealer
ADD CONSTRAINT fk_dealer_company FOREIGN KEY (id_company) REFERENCES company (id_company);


ALTER TABLE production
ADD CONSTRAINT fk_production_company FOREIGN KEY (id_company) REFERENCES company (id_company);


ALTER TABLE production
ADD CONSTRAINT fk_production_medicine FOREIGN KEY (id_medicine) REFERENCES medicine (id_medicine);


ALTER TABLE `order`
ADD CONSTRAINT fk_order_production FOREIGN KEY (id_production) REFERENCES production (id_production);


ALTER TABLE `order`
ADD CONSTRAINT fk_order_dealer FOREIGN KEY (id_dealer) REFERENCES dealer (id_dealer);


ALTER TABLE `order`
ADD CONSTRAINT fk_order_pharmacy FOREIGN KEY (id_pharmacy) REFERENCES pharmacy (id_pharmacy);


-- 2 Выдать информацию по всем заказам лекарства "Кордерон" компании "Аргус" с указанием названий аптек, дат, объема заказов
SELECT
  p.name AS Аптека,
  o.date AS Дата,
  o.quantity AS Объем
FROM
  `order` o
  JOIN pharmacy p ON o.id_pharmacy = p.id_pharmacy
  JOIN production pr ON o.id_production = pr.id_production
  JOIN medicine m ON pr.id_medicine = m.id_medicine
  JOIN company c ON pr.id_company = c.id_company
WHERE
  m.name = 'Кордерон'
  AND c.name = 'Аргус';


-- 3 Дать список лекарств компании “Фарма”, на которые не были сделаны заказы до 25 января.
SELECT
  m.name AS Лекарство
FROM
  medicine m
  JOIN production pr ON m.id_medicine = pr.id_medicine
  JOIN company c ON pr.id_company = c.id_company
  LEFT JOIN `order` o ON o.id_production = pr.id_production
  AND o.date < '2019-01-25'
WHERE
  c.name = 'Фарма'
  AND o.id_order IS NULL;


-- 4 Дать минимальный и максимальный баллы лекарств каждой фирмы, которая оформила не менее 120 заказов.
SELECT
  c.name AS Фирма,
  MIN(pr.rating) AS Минимальный_балл,
  MAX(pr.rating) AS Максимальный_балл
FROM
  company c
  JOIN production pr ON c.id_company = pr.id_company
WHERE
  c.id_company IN (
    SELECT
      pr2.id_company
    FROM
      `order` o
      JOIN production pr2 ON o.id_production = pr2.id_production
    GROUP BY
      pr2.id_company
    HAVING
      COUNT(*) >= 120
  )
GROUP BY
  c.id_company,
  c.name;


-- 5 Дать списки сделавших заказы аптек по всем дилерам компании “AstraZeneca”.
-- Если у дилера нет заказов, в названии аптеки проставить NULL.
SELECT
  d.name AS Дилер,
  d.phone AS Телефон,
  p.name AS Аптека
FROM
  dealer d
  LEFT JOIN `order` o ON d.id_dealer = o.id_dealer
  LEFT JOIN pharmacy p ON o.id_pharmacy = p.id_pharmacy
  JOIN company c ON d.id_company = c.id_company
WHERE
  c.name = 'AstraZeneca'
ORDER BY
  d.name,
  p.name;


-- 5 Дать списки сделавших заказы аптек по всем дилерам компании “AstraZeneca”.
-- Если у дилера нет заказов, в названии аптеки проставить NULL.
SELECT DISTINCT
  d.name AS Дилер,
  d.phone AS Телефон,
  p.name AS Аптека
FROM
  dealer d
  LEFT JOIN `order` o ON d.id_dealer = o.id_dealer
  LEFT JOIN pharmacy p ON o.id_pharmacy = p.id_pharmacy
  JOIN company c ON d.id_company = c.id_company
WHERE
  c.name = 'AstraZeneca'
ORDER BY
  d.name,
  p.name;


-- 6 Уменьшить на 20% стоимость всех лекарств, если она превышает 3000, а
-- длительность лечения не более 7 дней.
-- Изменение типа поля price с text на decimal
ALTER TABLE production
MODIFY COLUMN price DECIMAL(10, 2);


-- Уменьшаем на 20% стоимость всех лекарств
UPDATE production
SET
  price = price * 0.8
WHERE
  price > 3000
  AND id_medicine IN (
    SELECT
      id_medicine
    FROM
      medicine
    WHERE
      cure_duration <= 7
  );


-- 7 Добавить необходимые индексы
-- Индекс для поиска по названию компании
CREATE INDEX idx_company_name ON company (NAME);


-- Индекс для поиска дилеров по компании
CREATE INDEX idx_dealer_company ON dealer (id_company);


-- Индекс для поиска по названию лекарства
CREATE INDEX idx_medicine_name ON medicine (NAME);


-- Индекс для поиска по длительности лечения
CREATE INDEX idx_medicine_duration ON medicine (cure_duration);


-- Индекс для поиска производства по компании и лекарству
CREATE INDEX idx_production_company ON production (id_company);


CREATE INDEX idx_production_medicine ON production (id_medicine);


-- Индекс для поиска по цене
CREATE INDEX idx_production_price ON production (price);


-- Индекс для поиска заказов по дате
CREATE INDEX idx_order_date ON `order` (DATE);


-- Индекс для поиска заказов по дилеру
CREATE INDEX idx_order_dealer ON `order` (id_dealer);


-- Индекс для поиска заказов по аптеке
CREATE INDEX idx_order_pharmacy ON `order` (id_pharmacy);


-- Индекс для поиска заказов по производству
CREATE INDEX idx_order_production ON `order` (id_production);


-- Индекс для поиска аптек по рейтингу
CREATE INDEX idx_pharmacy_rating ON pharmacy (rating);