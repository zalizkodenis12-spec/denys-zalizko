export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { name, phone, project } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in environment variables.');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  const text = `🚀 Нова заявка з сайту!\n\n👤 Ім'я: ${name}\n📞 Телефон: ${phone}\n📋 Проект: ${project || 'Не вказано'}`;

  try {
    const tgUrl = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(tgUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Telegram API error:', errorData);
      return res.status(500).json({ message: 'Failed to send message to Telegram' });
    }

    return res.status(200).json({ success: true, message: 'Message sent!' });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
