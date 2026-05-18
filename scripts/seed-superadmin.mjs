// scripts/seed-superadmin.mjs
// Crea el usuario superAdmin inicial en la base de datos
// Uso: npm run seed:superadmin
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
if (!uri) { console.error('MONGODB_URI no definida'); process.exit(1); }

const userSchema = new mongoose.Schema({
  nombre:   String, apellido: String, email: { type: String, unique: true },
  password: String, rol: String, activo: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function main() {
  await mongoose.connect(uri);
  console.log('✅ Conectado a MongoDB');

  const email    = process.env.SUPERADMIN_EMAIL    || 'superadmin@mitienda.com';
  const password = process.env.SUPERADMIN_PASSWORD || 'SuperAdmin123!';

  const exists = await User.findOne({ email });
  if (exists) {
    console.log(`ℹ️  SuperAdmin ya existe: ${email}`);
    await mongoose.disconnect();
    return;
  }

  const hash = await bcrypt.hash(password, 12);
  await User.create({
    nombre:   'Super',
    apellido: 'Admin',
    email,
    password: hash,
    rol:      'superAdmin',
    activo:   true,
  });

  console.log('✅ SuperAdmin creado exitosamente');
  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${password}`);
  console.log('\n⚠️  IMPORTANTE: Cambiá el password después del primer login!');

  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
