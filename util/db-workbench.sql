SELECT products.*, cartitems.quantity FROM products
JOIN cartitems ON cartitems.productId = products.id
JOIN carts ON carts.id = cartitems.cartId
WHERE carts.userId = 1;

INSERT INTO cartitems SET
quantity = 1,
productId = 2,
cartId = (SELECT id FROM carts WHERE userId = 1);

SELECT * FROM cartitems
JOIN carts ON carts.id = cartitems.cartId
WHERE carts.userId = 1
AND cartitems.productId = 3;

UPDATE cartitems SET
quantity = quantity + 1
WHERE id = 1;

SELECT cartitems.* FROM cartitems
JOIN carts ON carts.id = cartitems.cartId
WHERE carts.userId = 1
AND cartitems.productId = 1;

DELETE FROM cartitems
WHERE cartitems.id = 1;

SELECT orderitems.*, products.title FROM orderitems
JOIN orders ON orders.id = orderitems.orderId
JOIN products ON products.id = orderitems.productId
WHERE orders.userId = 1;

SELECT ADDTIME(CURRENT_TIMESTAMP(), '1:0:0');
SELECT CURRENT_TIMESTAMP();

SELECT * FROM products LIMIT 1, 5;

SELECT COUNT(id) FROM products;








