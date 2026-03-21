/**
 * SEED RUNNER
 * ─────────────────────────────────────────────────────────────────
 * Run with: npm run seed
 *
 * What this does:
 *   1. Clears existing ParentMenu, Menu, Screen collections
 *   2. Inserts all items from seedData.js
 *   3. Creates the Super Admin role (isSuperAdmin: true)
 *   4. Creates the Super Admin system user from .env credentials
 *
 * Safe to re-run anytime — uses upsert so no duplicates
 * ─────────────────────────────────────────────────────────────────
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ParentMenu = require('./Models/ParentMenu');
const Menu = require('./Models/Menu');
const Screen = require('./Models/Screen');
const Role = require('./Models/Role');
const SystemUser = require('./Models/SystemUser');
const { parentMenus, menus, screens } = require('./seedData');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // ── STEP 1: Seed Parent Menus ──────────────────────────────
    console.log('\n📁 Seeding Parent Menus...');
    const parentMenuMap = {}; // code → _id

    for (const pm of parentMenus) {
      const doc = await ParentMenu.findOneAndUpdate(
        { code: pm.code },
        pm,
        { upsert: true, new: true }
      );
      parentMenuMap[pm.code] = doc._id;
      console.log(`   ✓ ${pm.name} (${pm.code})`);
    }

    // ── STEP 2: Seed Menus ─────────────────────────────────────
    console.log('\n📂 Seeding Menus...');
    const menuMap = {}; // code → _id

    for (const m of menus) {
      const parentId = parentMenuMap[m.parentMenuCode];
      if (!parentId) {
        console.warn(`   ⚠ Parent menu not found for: ${m.code} (parentMenuCode: ${m.parentMenuCode})`);
        continue;
      }

      const menuData = {
        name: m.name,
        code: m.code,
        parentMenu: parentId,
        icon: m.icon,
        order: m.order,
      };

      const doc = await Menu.findOneAndUpdate(
        { code: m.code },
        menuData,
        { upsert: true, new: true }
      );
      menuMap[m.code] = doc._id;
      console.log(`   ✓ ${m.name} (${m.code}) → under ${m.parentMenuCode}`);
    }

    // ── STEP 3: Seed Screens ───────────────────────────────────
    console.log('\n🖥  Seeding Screens...');
    const allScreenCodes = [];

    for (const s of screens) {
      const menuId = menuMap[s.menuCode];
      if (!menuId) {
        console.warn(`   ⚠ Menu not found for screen: ${s.code} (menuCode: ${s.menuCode})`);
        continue;
      }

      const screenData = {
        name: s.name,
        code: s.code,
        menu: menuId,
        route: s.route,
        description: s.description,
        order: s.order,
      };

      await Screen.findOneAndUpdate(
        { code: s.code },
        screenData,
        { upsert: true, new: true }
      );
      allScreenCodes.push(s.code);
      console.log(`   ✓ ${s.name} (${s.code}) → ${s.route}`);
    }

    // ── STEP 4: Create Super Admin Role ────────────────────────
    console.log('\n👑 Creating Super Admin Role...');
    let superAdminRole = await Role.findOne({ isSuperAdmin: true });

    if (!superAdminRole) {
      superAdminRole = await Role.create({
        name: 'Super Admin',
        description: 'Full access to all modules — cannot be modified',
        isSuperAdmin: true,
        permissions: allScreenCodes.map((code) => ({
          screenCode: code,
          canView: true,
          canCreate: true,
          canEdit: true,
          canDelete: true,
        })),
      });
      console.log('   ✓ Super Admin role created');
    } else {
      // Update permissions to include any newly added screens
      superAdminRole.permissions = allScreenCodes.map((code) => ({
        screenCode: code,
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
      }));
      await superAdminRole.save();
      console.log('   ✓ Super Admin role updated with latest screens');
    }

    // ── STEP 5: Create Super Admin System User ─────────────────
    console.log('\n👤 Creating Super Admin User...');
    const superUsername = process.env.SUPER_ADMIN_USERNAME || 'superadmin';
    const superPassword = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123';

    let superUser = await SystemUser.findOne({ isSuperAdmin: true });

    if (!superUser) {
      superUser = await SystemUser.create({
        firstName: 'Super',
        lastName: 'Admin',
        username: superUsername,
        password: superPassword,
        role: superAdminRole._id,
        isSuperAdmin: true,
        isActive: true,
      });
      console.log(`   ✓ Super Admin user created → username: ${superUsername}`);
    } else {
      console.log(`   ✓ Super Admin user already exists → username: ${superUser.username}`);
    }

    console.log('\n🎉 Seed completed successfully!\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
