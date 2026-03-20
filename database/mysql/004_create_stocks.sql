-- Stocks table for Pizza dal Cielo (pizzas, boissons, friands, etc.)
-- equipe de Dal Cielo can update quantities and create new items in real time

CREATE TABLE IF NOT EXISTS stocks (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  item_id VARCHAR(64) NOT NULL,
  name VARCHAR(120) NOT NULL,
  category VARCHAR(64) NOT NULL,
  quantity INT NOT NULL DEFAULT 20,
  min_threshold INT NOT NULL DEFAULT 5,
  unit VARCHAR(32) NOT NULL DEFAULT 'unité',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_stocks_item_id (item_id)
);

CREATE INDEX idx_stocks_category ON stocks(category);
