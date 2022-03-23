const Discord = require("discord.js");
const client = new Discord.Client();
client.db = require("quick.db");
client.request = new (require("rss-parser"))();
client.config = require("./config.js");
const randomPuppy = require('random-puppy');
const express = require('express');
const server = express();
server.all('/', (req, res)=>{
    res.send('[Gopron] A bot elindult!')
})
function keepAlive(){
    server.listen(3000, ()=>{console.log("[SERVER] A szerver elindult!")});
}

client.on("ready", () => {
    console.log("[Gopron] Elindult!");
    handleUploads();

  let státuszok = [
        `${client.guilds.cache.size} szerver | CsGameBot`,
        `${client.guilds.cache.size} szerver | Egyedi bot`,
        "Gopron Host (HunkDEV) készítette"
    ]

    setInterval(function() {
        let status = státuszok[Math.floor(Math.random()* státuszok.length)]

        client.user.setActivity(status, {type: "WATCHING"})
    }, 9000)
});

function handleUploads() {
    if (client.db.fetch(`postedVideos`) === null) client.db.set(`postedVideos`, []);
    setInterval(() => {
        client.request.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${client.config.channel_id}`)
        .then(data => {
            if (client.db.fetch(`postedVideos`).includes(data.items[0].link)) return;
            else {
                client.db.set(`videoData`, data.items[0]);
                client.db.push("postedVideos", data.items[0].link);
                let parsed = client.db.fetch(`videoData`);
                let channel = client.channels.cache.get(client.config.channel);
                if (!channel) return;
                let message = client.config.messageTemplate
                    .replace(/{author}/g, parsed.author)
                    .replace(/{title}/g, Discord.Util.escapeMarkdown(parsed.title))
                    .replace(/{url}/g, parsed.link);
                channel.send(message);
            }
        });
    }, client.config.watchInterval);
}

client.on("message", async message => {
    let MessageArray = message.content.split(" ");
    let cmd = MessageArray[0];
    let args = MessageArray.slice(1);

    if(message.author.bot) return;
    if(message.channel.type === "dm") return;

  if(cmd === "!meme") {
    const subreddits = ["dankmeme", "meme", "me_irl", "hun"]
    const random = subreddits[Math.floor(Math.random() * subreddits.length)]

    const IMG = await randomPuppy(random)
    const MemeEmbed = new Discord.MessageEmbed()
    .setColor("RANDOM")
    .setImage(IMG)
    .setTitle(`Keresési szöveg: ${random}`)
    .setURL(`https://www.reddit.com/r/${random}`)

    message.channel.send(MemeEmbed)
  }

    if(cmd === "!youtube") {
      const embed = new Discord.MessageEmbed()
      .setTitle("CsGame-Brawl Stars YouTube Csatornája")
      .setDescription("**[CsGame-Brawl Stars](https://youtube.com/channel/UClqSpTEMskN80_S_eh4sojA)**")
      .setColor("GREEN")
      .setTimestamp()
      .setFooter("Készítette: Gopron Host (HunkDEV)")

      message.channel.send(embed)
    }

})

keepAlive();

client.login(client.config.token);
