CREATE TRIGGER "Order_validate_status_insert"
BEFORE INSERT ON "Order"
WHEN NEW."status" NOT IN ('open', 'paid', 'cancelled')
BEGIN
  SELECT RAISE(ABORT, 'Invalid order status');
END;

CREATE TRIGGER "Order_validate_status_update"
BEFORE UPDATE OF "status" ON "Order"
WHEN NEW."status" NOT IN ('open', 'paid', 'cancelled')
BEGIN
  SELECT RAISE(ABORT, 'Invalid order status');
END;

CREATE TRIGGER "Order_validate_type_insert"
BEFORE INSERT ON "Order"
WHEN NEW."orderType" NOT IN ('dine_in', 'takeaway', 'delivery')
BEGIN
  SELECT RAISE(ABORT, 'Invalid order type');
END;

CREATE TRIGGER "Order_validate_type_update"
BEFORE UPDATE OF "orderType" ON "Order"
WHEN NEW."orderType" NOT IN ('dine_in', 'takeaway', 'delivery')
BEGIN
  SELECT RAISE(ABORT, 'Invalid order type');
END;

CREATE TRIGGER "Order_validate_discount_type_insert"
BEFORE INSERT ON "Order"
WHEN NEW."discountType" NOT IN ('none', 'percent', 'amount')
BEGIN
  SELECT RAISE(ABORT, 'Invalid discount type');
END;

CREATE TRIGGER "Order_validate_discount_type_update"
BEFORE UPDATE OF "discountType" ON "Order"
WHEN NEW."discountType" NOT IN ('none', 'percent', 'amount')
BEGIN
  SELECT RAISE(ABORT, 'Invalid discount type');
END;
