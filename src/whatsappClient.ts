import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { generateResponse } from './aiService';
import { handleQuizCommand, handleMathCommand, handleGenerateQuizCommand } from './gameService';

const client = new Client({
  authStrategy: new LocalAuth(),
});

client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('Client is ready!');
});

client.on('message', async msg => {
  const message = msg.body;
  const sender = msg.from;

  console.log(`Message received from ${sender}: ${message}`);

  try {
    if (message.startsWith('.')) {
      const [command, ...argsArray] = message.substring(1).toLowerCase().split(' ');
      const args = argsArray.join(' ');

      switch (command) {
        case 'ping':
          msg.reply('Pong!');
          break;
        case 'kuis':
          const quizResponse = await handleQuizCommand(sender, args);
          msg.reply(quizResponse);
          break;
        case 'math':
          const mathResponse = await handleMathCommand(sender, args);
          msg.reply(mathResponse);
          break;
        case 'buatkuis':
          const generateQuizResponse = await handleGenerateQuizCommand(args);
          msg.reply(generateQuizResponse);
          break;
        default:
          const aiResponse = await generateResponse(message);
          msg.reply(aiResponse);
      }
    } else {
      // Kirim pesan ke Gemini AI jika bukan perintah
      const aiResponse = await generateResponse(message);
      msg.reply(aiResponse);
    }
  } catch (error: any) {
    console.error("Error processing message:", error);
    msg.reply("Terjadi kesalahan. Mohon coba lagi setelah beberapa saat atau kirim '.reset'.");
  }
});

client.initialize();