discord.on(discord.Event.GUILD_MEMBER_REMOVE, async (user) => {
  const general = await discord.getTextChannel('LOG_CHANNEL_ID');//Only necessary if you want to send a message when a user leaves
  const kv = new pylon.KVNamespace('potato');
  await kv.delete(user.user.id);
  await general?.sendMessage(
    `${user.user.toMention()} has left the server and their potatoes have been reset` //Only necessary if you want to send a message when a user leaves
  );
});
