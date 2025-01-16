import { initializeDatabase } from './database';
import './whatsappClient'; // Import untuk menjalankan inisialisasi client WhatsApp

const startApp = async () => {
  await initializeDatabase();
  console.log('Aplikasi dimulai...');
};

startApp();