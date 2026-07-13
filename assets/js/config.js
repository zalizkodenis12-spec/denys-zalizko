// Заповни ці два значення, щоб заявки з форми приходили в Telegram.
// Як отримати:
// 1. У Telegram напиши @BotFather -> /newbot -> отримай токен виду 123456789:AAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
// 2. Знайди свого бота в Telegram і натисни Start (напиши йому будь-що)
// 3. Відкрий у браузері: https://api.telegram.org/bot<ТВІЙ_ТОКЕН>/getUpdates
//    і знайди в відповіді "chat":{"id":12345678 -- це і є chatId
window.SITE_CONFIG = {
  telegramBotToken: 'PASTE_YOUR_BOT_TOKEN_HERE',
  telegramChatId: 'PASTE_YOUR_CHAT_ID_HERE',
  phone: '+380672302233',
  phoneDisplay: '067 230 22 33'
};