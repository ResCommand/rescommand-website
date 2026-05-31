# Database Schema — Duffera Donuts Ops

## Users & Auth
- **User**: id, email, name, password_hash, role (EMPLOYEE/MANAGER/OWNER), phone, active, created_at, updated_at
- **Session**: NextAuth managed

## Products
- **ProductCategory**: id, name, type (DONUT/DRINK/DOGEL/SANDWICH/OTHER), foh_boh (FOH/BOH/BOTH)
- **Product**: id, name, category_id, description, price, cost, active
- **ProductIngredient**: id, product_id, inventory_item_id, quantity_used

## Sales & Logging
- **Transaction**: id, user_id, total_amount, payment_method, notes, created_at
- **TransactionLine**: id, transaction_id, product_id, quantity, unit_price, total
- **DrinkLog**: id, user_id, drink_type, size, milk_type, espresso_shots, dial_setting, waste, notes, created_at
- **DonutLog**: id, user_id, product_id, made, sold, wasted, period (AM/PM), created_at

## Inventory
- **Vendor**: id, name, role, mainUse, cadence, contactInfo, active, createdAt, updatedAt
- **InventoryItem**: id, name, category (FOH/BOH), unit, unit_cost, par_level, current_stock, min_stock, reorder_qty, supplier, active, vendor_id (FK), pack_size, suggested_cadence, sku, notes
- **InventoryOrder**: id, status (DRAFT/ORDERED/RECEIVED/PARTIAL), created_by, created_at, received_at, notes
- **InventoryOrderLine**: id, order_id, inventory_item_id, qty_ordered, qty_received, unit_cost
- **InventoryCount**: id, date (unique), counted_by, notes, created_at
- **InventoryCountLine**: id, count_id, inventory_item_id, on_hand, amount_to_order
- **OrderRequest**: id, inventory_item_id, qty_requested, requested_by, notes, status (PENDING/APPROVED/ORDERED/FULFILLED/CANCELLED), reviewed_by, reviewed_at, created_at, updated_at
- **PrepStockItem**: id, name, category, quantity, unit, shelf_life_hours, prepared_at, expires_at, active

## Prediction & Par
- **HolidaySchedule**: id, date, name, impact_level (LOW/MEDIUM/HIGH), notes
- **WeatherCache**: id, date, temp_high, temp_low, precipitation, conditions, fetched_at
- **ParSheet**: id, date, generated_by, notes
- **ParSheetLine**: id, par_sheet_id, product_id, par_level, on_hand, to_make, actual_sold, predicted
- **PredictionModel**: id, product_id, day_of_week, avg_sold, weather_factor, holiday_factor

## Operations
- **OverboardSchedule**: id, date, status (SCHEDULED/IN_PROGRESS/COMPLETE), notes
- **OverboardLine**: id, overboard_id, product_id, quantity, fillings, toppings
- **CleaningTask**: id, title, description, frequency (DAILY/WEEKLY/MONTHLY), assigned_to, location, active
- **CleaningLog**: id, task_id, completed_by, completed_at, notes
- **MaintenanceLog**: id, equipment, issue, resolved, resolved_by, resolved_at, created_by, created_at, notes
- **EmployeeHour**: id, user_id, clock_in, clock_out, total_hours, date, notes

## Relationships
- User 1:N Transaction, DonutLog, DrinkLog, EmployeeHour, CleaningLog
- ProductCategory 1:N Product
- Product 1:N ProductIngredient, TransactionLine, DonutLog, ParSheetLine
- InventoryItem 1:N ProductIngredient, InventoryOrderLine
- InventoryOrder 1:N InventoryOrderLine
- ParSheet 1:N ParSheetLine
- OverboardSchedule 1:N OverboardLine
- CleaningTask 1:N CleaningLog