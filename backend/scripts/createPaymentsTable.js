const { executeQuery } = require("../config/database");

const createPaymentsTable = async () => {
  try {
    console.log("🗃️  Creating payments table...");

    // Create payments table
    const createPaymentsSQL = `
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        user_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        status ENUM('pending', 'success', 'failed', 'cancelled') DEFAULT 'pending',
        reference_number VARCHAR(100) UNIQUE,
        payment_url TEXT,
        paid_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_order_id (order_id),
        INDEX idx_user_id (user_id),
        INDEX idx_status (status),
        INDEX idx_reference_number (reference_number)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    const result = await executeQuery(createPaymentsSQL);

    if (result.success) {
      console.log("✅ Payments table created successfully");
    } else {
      console.error("❌ Failed to create payments table:", result.error);
    }
  } catch (error) {
    console.error("❌ Error creating payments table:", error);
  }
};

// Run if called directly
if (require.main === module) {
  createPaymentsTable()
    .then(() => {
      console.log("🎉 Payments table setup completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Setup failed:", error);
      process.exit(1);
    });
}

module.exports = { createPaymentsTable };
