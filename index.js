const Discord = require('discord.js');
const fs = require("fs")
const ytsearch  = require('youtube-search');
const YoutubeMp3Downloader = require("youtube-mp3-downloader");
const bot = new Discord.Client();


const Token = 'Njk5NjEzOTA0MDc0MTc4NjAx.XpW8UA.5aMv58FSQUBLeak2kl1gGSx9Ipc';


bot.login(Token);

var opts = 
{
    maxResults: 10,
    key: 'AIzaSyDV7F0GUtfkpX7sXAYye56c0iSurQSW-sg'
};

//Configure YoutubeMp3Downloader with your settings
var YD = new YoutubeMp3Downloader({
    "ffmpegPath": './ffmpeg.exe',        // Where is the FFmpeg binary located?
    "outputPath": "./mp3/",    // Where should the downloaded and encoded files be stored?
    "youtubeVideoQuality": "highest",       // What video quality should be used?
    "queueParallelism": 2,                  // How many parallel downloads/encodes should be started?
    "progressTimeout": 2000                 // How long should be the interval of the progress reports
});

var files = [];
var sentInit = false;
var sentProg = false;

bot.on('ready', () => 
{
    console.info(`Logged in as ${bot.user.tag}!`);

    bot.user.setPresence(
    {  
        activity: { name: 'with Kugel-kun' }, status: 'Online' 
    })
    .then(console.log).catch(console.error);
});

bot.on('message', msg => 
{
    rawmsg = msg.content.toLowerCase();

    if(msg.author.bot) 
        return;

    if (rawmsg.startsWith('/d'))
    {   
        rawmsg = rawmsg.split('/d');

        ytsearch(rawmsg[1], opts , function(err, res)
        {   
            files = [];
            sentInit = false;
            if(err)
            {
                msg.reply(err);
            }
            else
            {
                console.log(res);
                console.log(res[0].title);
                
                if(fs.existsSync(`./mp3/${res[0].title}.mp3`))
                {
                    msg.channel.send(`${res[0].title} Detected In Local Archive.`)
                    msg.channel.send(`Sending ${res[0].title}.`)
                    msg.channel.send({files:[`./mp3//${res[0].title}.mp3`]})
                }
                else
                {
                    msg.channel.send(`Downloading ${res[0].title}....`)   
                    //Download video and save as MP3 file
                    YD.download(res[0].id);
                    
                    YD.on("finished", function(err, data) 
                    {
                        //data = JSON.stringify(data);
                        if(sentInit === false)
                        {
                            msg.channel.send(`Downloded ${data['videoTitle']}... Successfully. `)
                            msg.channel.send(
                            {
                                files: [data['file']]
                            });
                            sentInit = true;
                        }             
                    });
                    
                    YD.on("error", function(error) 
                    {
                        console.log(error);
                    });
                    
                    YD.on("progress", function(progress) {
                        console.log(JSON.stringify(progress));
                        //msg.channel.send(`Coverting ${res[0].title} : ${progress['progress']['percentage'].toFixed(1)}% To MP3....`)  
                    });
                }
                
            }
        })
    }
});
