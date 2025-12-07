/**
 * One-time Demo Data Seed Script
 * 
 * This script:
 * 1. Removes orders that reference non-existent menu items
 * 2. Creates 150 realistic dummy orders over the last 30 days
 * 
 * Run with: node scripts/seedDemoOrders.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../api/models/Order.js';
import MenuItem from '../api/models/MenuItem.js';
import User from '../api/models/User.js';

dotenv.config();

const DAYS_OF_DATA = 30;
const NUM_ORDERS = 150;

async function cleanupOrphanedOrders() {
    console.log('\n🧹 Cleaning up orders with deleted menu items...\n');

    // Get all valid menu item IDs
    const validMenuItems = await MenuItem.find({}).select('_id');
    const validIds = validMenuItems.map(m => m._id.toString());

    console.log(`   Found ${validIds.length} valid menu items`);

    // Find all orders
    const allOrders = await Order.find({});
    let ordersRemoved = 0;
    let itemsRemoved = 0;

    for (const order of allOrders) {
        const originalItemCount = order.items.length;

        // Filter to keep only items with valid menu item references
        order.items = order.items.filter(item => {
            const isValid = validIds.includes(item.menuItem.toString());
            if (!isValid) itemsRemoved++;
            return isValid;
        });

        if (order.items.length === 0) {
            // Remove order entirely if no valid items left
            await Order.findByIdAndDelete(order._id);
            ordersRemoved++;
        } else if (order.items.length !== originalItemCount) {
            // Update order if some items were removed
            await order.save();
        }
    }

    console.log(`   ✅ Removed ${itemsRemoved} orphaned item references`);
    console.log(`   ✅ Deleted ${ordersRemoved} empty orders`);
}

async function seedDemoOrders() {
    console.log('\n🌱 Seeding demo orders...\n');

    // Get all menu items
    const menuItems = await MenuItem.find({});
    if (menuItems.length === 0) {
        console.log('   ❌ No menu items found! Please add menu items first.');
        return;
    }
    console.log(`   Found ${menuItems.length} menu items to use`);

    // Get a user to associate orders with (or create a demo user)
    let user = await User.findOne({ role: 'customer' });
    if (!user) {
        user = await User.findOne({});
    }
    if (!user) {
        console.log('   ❌ No users found! Please create a user first.');
        return;
    }
    console.log(`   Using user: ${user.email}`);

    // Generate orders
    const orders = [];
    const now = new Date();

    for (let i = 0; i < NUM_ORDERS; i++) {
        // Random date within the last DAYS_OF_DATA days
        const daysAgo = Math.random() * DAYS_OF_DATA;
        const orderDate = new Date(now);
        orderDate.setDate(orderDate.getDate() - daysAgo);
        orderDate.setHours(
            8 + Math.floor(Math.random() * 12), // Between 8 AM and 8 PM
            Math.floor(Math.random() * 60),
            Math.floor(Math.random() * 60)
        );

        // Random number of items (1-4 items per order)
        const numItems = 1 + Math.floor(Math.random() * 4);
        const items = [];
        let total = 0;

        // Weight certain items higher to create "best sellers"
        const weightedItems = [];
        menuItems.forEach((item, index) => {
            // First few items get higher weight (will appear more often)
            const weight = Math.max(1, 5 - index);
            for (let w = 0; w < weight; w++) {
                weightedItems.push(item);
            }
        });

        for (let j = 0; j < numItems; j++) {
            const randomItem = weightedItems[Math.floor(Math.random() * weightedItems.length)];
            const quantity = 1 + Math.floor(Math.random() * 3); // 1-3 quantity

            items.push({
                menuItem: randomItem._id,
                quantity: quantity,
                customizations: []
            });

            total += randomItem.price * quantity;
        }

        orders.push({
            user: user._id,
            items: items,
            total: parseFloat(total.toFixed(2)),
            status: 'completed',
            createdAt: orderDate,
            updatedAt: orderDate
        });
    }

    // Insert all orders
    await Order.insertMany(orders);

    console.log(`   ✅ Created ${NUM_ORDERS} demo orders`);

    // Show summary
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    console.log(`   📊 Total revenue generated: $${totalRevenue.toFixed(2)}`);
}

async function main() {
    try {
        console.log('═══════════════════════════════════════════════');
        console.log('       Demo Data Seed Script for Wolf Cafe      ');
        console.log('═══════════════════════════════════════════════');

        // Connect to MongoDB
        console.log('\n📡 Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('   ✅ Connected!\n');

        // Step 1: Clean up orphaned data
        await cleanupOrphanedOrders();

        // Step 2: Seed demo orders
        await seedDemoOrders();

        console.log('\n═══════════════════════════════════════════════');
        console.log('   ✅ DONE! Refresh your Sales Stats page.');
        console.log('═══════════════════════════════════════════════\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

main();
