discord.on(discord.Event.MESSAGE_CREATE, async (message) => {
  if (message.author.id !== '302050872383242240') return;//The disboard bot id
  const [embed] = message.embeds;
  if (!embed) return;

  if (!embed.description?.includes('Bump done')) return;
  const [mentionString] = embed.description.match(/<!?@(\d+)>/g) || [];
  if (!mentionString) return;
  const [user] = mentionString.match(/\d+/g) || [];
  if (!user) return;
//Checking if the bump was a success


  const kv = new pylon.KVNamespace('potato');
  const POTATO_REWARD = 2; //Define how many potatoes there are as a reward for bumping
  const newCount = await kv.transact(
    user,
    (prev: number | undefined) => (prev || 0) + POTATO_REWARD
  );
  await message.reply(
    `${(
      await discord.getUser(user)
    )?.getTag()} just got ${POTATO_REWARD} potatos for bumping the server! They now have ${newCount}`
  );
});
