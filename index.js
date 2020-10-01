require('dotenv/config');
const request = require('request'),
    info = require('./db.js'),
    TelegramBot = require('node-telegram-bot-api'),
    bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

let i = 0;
bot.on('sticker', (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, '😍');
});

bot.on('message', async (msg) => {
    let opts = {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: '1',
                        callback_data: '1'
                    }, {
                        text: '2',
                        callback_data: '2'
                    }, {
                        text: '3',
                        callback_data: '3'
                    }
                ]
            ]
        }
    }
    const onVideoText = (msg) => {
        const url = 'http://62.109.27.26:8000/files/6';
        const video = request(url);
        bot.sendVideo(msg.chat.id, video);
    }
    const chatId = msg.chat.id;
    const first_name = msg.chat.first_name;
    if (msg.text) {
        const text = msg.text.toLowerCase();
        if (~text.indexOf('start') || ~text.indexOf('привет')) {
            bot.sendMessage(chatId, `   
привет, ${first_name}!
я - КиберКот, киберагент!
сыграем в игру?
напиши 'да', если хочешь начать
`)
        } else if (~text.indexOf('да')) {
            i = 0;
            await bot.sendMessage(chatId, 'тебе необходимо выбрать правильный вариант ответа - будь внимателен 😉 приступим!', onVideoText(msg));
            await bot.sendMessage(chatId, info[i].question)
            await bot.sendMessage(chatId, info[i].answers, opts)
        } else if (~text.indexOf('следующий вопрос')) {
            if (info[i].id !== 10) {
                await bot.sendMessage(chatId, info[++i].question)
                await bot.sendMessage(chatId, info[i].answers, opts)
            } else {
                await bot.sendMessage(chatId, 'ты отлично справился с тестом, так держать! \nеще больше информации ты найдешь на нашем образовательном портале ✌🏻', {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: 'Education Kids',
                                    url: 'https://education.github.com/'
                                }
                            ],
                            [
                                {
                                    text: 'пройти заново',
                                    callback_data: 'again'
                                }
                            ]
                        ]
                    }
                })
            }
        } else {
            bot.sendMessage(chatId, '😉');
        }
    }
});

bot.on('callback_query', query => {
    let rightAnswer;
    let md;
    let id = query.message.chat.id;
    let opts = {
        reply_markup: {
            keyboard: [
                [
                    'следующий вопрос'
                ]
            ],
            one_time_keyboard: true
        }
    }
    info.forEach(elem => {
        if (elem.answers === query.message.text) {
            rightAnswer = elem.rightAnswer;
            return rightAnswer;
        }
    })
    if (query.data !== rightAnswer) {
        md = `не угадал, попробуй еще раз!`;
        bot.sendMessage(id, md, { parse_mode: 'Markdown' });
    } else if (query.data === rightAnswer) {
        bot.sendMessage(id, info[i].info, opts)
    }
})

bot.on('polling_error', (msg) => console.log(msg));
