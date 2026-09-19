const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();

// Целосна CORS конфигурација
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Рачно овозможување за Preflight (OPTIONS) барања
app.options('*', cors());

app.use(express.json());

// Конфигурација на Mailtrap SMTP
const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST || 'sandbox.smtp.mailtrap.io',
  port: parseInt(process.env.MAILTRAP_PORT || '2525'),
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  }
});

app.get('/', (req, res) => {
  res.send('Mailtrap Email Service raboti!');
});

app.post('/send-email', async (req, res) => {
  console.log('>>> Стигна барање за мејл! <<<', req.body);

  const { to, subject, html } = req.body;

  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Полињата to, subject и html се задолжителни!' });
  }

  const mailOptions = {
    from: '"Ticket System" <no-reply@tvojot-domen.com>',
    to: to,
    subject: subject,
    html: html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Мејлот е успешно испратен:', info.messageId);
    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Грешка при испраќање мејл:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Mailtrap серверот работи на порт ${PORT}`);
});