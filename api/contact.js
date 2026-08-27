export default async function handler(req, res) {
  // CORS & headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed. Only POST is supported.' });
  }

  try {
    const { name, phone, project } = req.body || {};

    // 1. Backend validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ success: false, error: "Будь ласка, введіть коректне ім'я (мінімум 2 літери)." });
    }

    if (!phone || typeof phone !== 'string') {
      return res.status(400).json({ success: false, error: 'Будь ласка, введіть номер телефону.' });
    }

    const cleanedPhone = phone.replace(/[\s\-\(\)]/g, '');
    if (cleanedPhone.length < 9) {
      return res.status(400).json({ success: false, error: 'Номер телефону повинен містити щонайменше 9-10 цифр.' });
    }

    if (!project || typeof project !== 'string' || project.trim().length < 3) {
      return res.status(400).json({ success: false, error: 'Будь ласка, опишіть ваш проєкт або задачу.' });
    }

    // 2. Environment Variables Check
    const token = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID || process.env.CHAT_ID;

    if (!token || !chatId) {
      console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in environment variables.');
      return res.status(500).json({
        success: false,
        error: 'Помилка конфігурації сервера: змінні TELEGRAM_BOT_TOKEN або TELEGRAM_CHAT_ID не налаштовані.'
      });
    }

    // 3. HTML Escaping for safe Telegram formatting
    const escapeHtml = (str) => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    };

    const cleanName = escapeHtml(name.trim());
    const cleanPhone = escapeHtml(phone.trim());
    const cleanProject = escapeHtml(project.trim());

    // Kyiv timestamp
    const kyivTime = new Intl.DateTimeFormat('uk-UA', {
      timeZone: 'Europe/Kyiv',
      dateStyle: 'short',
      timeStyle: 'medium'
    }).format(new Date());

    const messageText = 
`🚀 <b>НОВА ЗАЯВКА З САЙТУ DenisWeb Studio!</b>

👤 <b>Клієнт:</b> ${cleanName}
📞 <b>Телефон:</b> <code>${cleanPhone}</code>
💬 <b>Опис проєкту:</b>
${cleanProject}

📅 <b>Дата та час:</b> ${kyivTime}`;

    // 4. Send request to Telegram Bot API
    const tgUrl = `https://api.telegram.org/bot${token}/sendMessage`;
    const tgResponse = await fetch(tgUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });

    const tgData = await tgResponse.json();

    if (!tgResponse.ok || !tgData.ok) {
      console.error('Telegram API error response:', tgData);
      return res.status(502).json({
        success: false,
        error: 'Не вдалося доставити повідомлення в Telegram.',
        details: tgData.description || 'Unknown Telegram error'
      });
    }

    return res.status(200).json({
      success: true,
      message: "Дякуємо! Вашу заявку прийнято. Ми зв'яжемося з вами найближчим часом."
    });

  } catch (error) {
    console.error('Internal Server Error in /api/contact:', error);
    return res.status(500).json({
      success: false,
      error: 'Сталася помилка при відправці заявки. Спробуйте ще раз або напишіть нам напряму.',
      details: error.message
    });
  }
}
