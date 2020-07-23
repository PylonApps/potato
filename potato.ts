const potatoCommands = new discord.command.CommandGroup({
  defaultPrefix: '!'
});
const potatoKV = new pylon.KVNamespace('potato');
const randomTimeBetween = (min: number, max: number) =>
  Math.round(Math.random() * (max - min) + min);

discord.on(discord.Event.MESSAGE_CREATE, async (message: discord.Message) => {
  if (!message.author) return;

  if (await potatoKV.get<boolean>('cooldown')) {
    if (message.content === discord.decor.Emojis.POTATO) {
      const [lastChannel, potatoId] =
        (await potatoKV.get<string>('lastPotato'))?.split('-') || [];
      if (lastChannel !== message.channelId) return;

      await message
        .getChannel()
        .then((c) => c.getMessage(potatoId))
        .then((m) => m?.delete())
        .catch(() => {});

      await message.delete().catch(() => {});

      const currentCount =
        ((await potatoKV.get<number>(message.author.id)) || 0) + 1;
      await potatoKV.put(message.author.id, currentCount);
      await potatoKV.delete('lastPotato');
      await message.reply(
        new discord.Embed({
          title: `${discord.decor.Emojis.POTATO} potato claimed ${discord.decor.Emojis.POTATO}`,
          description: `${message.author.getTag()} has claimed a potato, and now holds onto ${currentCount} potato${
            currentCount === 1 ? '' : 's'
          }.`,
          color: 0x11111c,
          thumbnail: { url: message.author.getAvatarUrl() },
          footer: { text: "to the rest of you, can't catch em all, right?" }
        })
      );
    }

    return;
  }

  if (Math.random() > 0.3) return;

  const reply = await message.reply(discord.decor.Emojis.POTATO);

  const cooldown = randomTimeBetween(3 * 60 * 1000, 20 * 60 * 1000);

  await potatoKV.put('cooldown', true, { ttl: cooldown });
  await potatoKV.put('lastPotato', `${message.channelId}-${reply.id}`, {
    ttl: cooldown
  });
});

potatoCommands.subcommand('potato', (subCommandGroup) => {
  subCommandGroup.on(
    { name: 'help', description: 'potato help' },
    () => ({}),
    async (message) => {
      await message.reply(
        new discord.Embed({
          title: `${discord.decor.Emojis.POTATO} help ${discord.decor.Emojis.POTATO}`,
          description: [
            `when a ${discord.decor.Emojis.POTATO} is dropped, be the first to pick it up by posting a ${discord.decor.Emojis.POTATO} too.`,
            '',
            '**commands**:',
            '- `!potato help` - shows this help message',
            '- `!potato` - show off your potato balance',
            '- `!potato inspect [user]` - inspect another [user]s potato balance',
            '- `!potato gamble <count>` - gamble <count> potatos',
            '- `!potato steal <who> <count>` - steal potatos from other people',
            "- `!potato give <who> <count>` - give your potatos to other people - if you're feeling kind."
          ].join('\n')
        })
      );
    }
  );

  subCommandGroup.on(
    { name: '', description: 'potato count' },
    (args) => ({}),
    async (message, {}) => {
      const target = message.author;

      const currentCount = (await potatoKV.get<number>(target.id)) || 0;
      await message.reply(
        new discord.Embed({
          title: `${discord.decor.Emojis.POTATO} potato count ${discord.decor.Emojis.POTATO}`,
          description: `${message.author.getTag()} has ${currentCount} potato${
            currentCount === 1 ? '' : 's'
          }. ${discord.decor.Emojis.POTATO.repeat(currentCount)}`,
          color: 0x11111c,
          thumbnail: { url: message.author.getAvatarUrl() }
        })
      );
    }
  );

  subCommandGroup.on(
    { name: 'inspect', description: 'potato count' },
    (args) => ({ who: args.user() }),
    async (message, { who }) => {
      const target = who;

      const currentCount = (await potatoKV.get<number>(target.id)) || 0;
      await message.reply(
        new discord.Embed({
          title: `${discord.decor.Emojis.POTATO} potato count ${discord.decor.Emojis.POTATO}`,
          description: `${message.author.getTag()} has ${currentCount} potato${
            currentCount === 1 ? '' : 's'
          }. ${discord.decor.Emojis.POTATO.repeat(currentCount)}`,
          color: 0x11111c,
          thumbnail: { url: message.author.getAvatarUrl() }
        })
      );
    }
  );

  subCommandGroup.on(
    { name: 'gamble', description: 'gamble potatos' },
    (args) => ({ count: args.integer() }),
    async (message, { count }) => {
      const currentCount =
        (await potatoKV.get<number>(message.author?.id)) || 0;

      if (count > currentCount)
        return await message.reply(
          'You can only gamble as many potatos as you have!'
        );

      if (count > 10 || count < 1)
        return await message.reply(
          'You can only gamble between 1 and 10 potatos.'
        );

      const won = Math.random() > 0.5;
      const newCount = currentCount + count * (won ? 1 : -1);
      await potatoKV.put(message.author?.id, newCount);

      await message.reply(
        new discord.Embed({
          title: `${discord.decor.Emojis.GAME_DIE} ${discord.decor.Emojis.POTATO} ${discord.decor.Emojis.GAME_DIE}`,
          description: `Your gambling ${won ? 'paid off' : 'sucked'}, you ${
            won ? 'gained' : 'lost'
          } ${count} potato${
            count === 1 ? '' : 's'
          }, giving you a total of ${newCount} potato${
            newCount === 1 ? '' : 's'
          }. ${discord.decor.Emojis.POTATO.repeat(newCount)} ${
            won
              ? discord.decor.Emojis.CHART_WITH_UPWARDS_TREND
              : discord.decor.Emojis.CHART_WITH_DOWNWARDS_TREND
          }`,
          color: 0x11111c
        })
      );
    }
  );

  subCommandGroup.on(
    { name: 'steal', description: 'steal potatos' },
    (args) => ({ who: args.user(), count: args.integer() }),
    async (message, { who, count }) => {
      if (message.author?.id === who.id)
        return await message.reply("You can't steal from yourself!");
      const success = Math.random() < 0.25;
      const userPotatos = (await potatoKV.get<number>(message.author?.id)) || 0;
      const targetPotatos = (await potatoKV.get<number>(who.id)) || 0;

      if (count > userPotatos)
        return await message.reply(
          'You can only steal as many potatos as you have!'
        );

      if (count > targetPotatos)
        return await message.reply('That user doesnt have that many potatos!');

      if (count > 5)
        return await message.reply(
          'Your small hands can only carry 5 potatos!'
        );

      const newUserPotatos = userPotatos + count * (success ? 1 : -1);
      const newTargetPotatos = targetPotatos + count * (success ? -1 : 1);

      await potatoKV.put(message.author?.id, newUserPotatos);
      await potatoKV.put(who.id, newTargetPotatos);

      await message.reply(
        new discord.Embed({
          title: `${discord.decor.Emojis.GLOVES} ${discord.decor.Emojis.POTATO} ${discord.decor.Emojis.GLOVES}`,
          description: `Your thievery ${success ? 'paid off' : 'sucked'}, you ${
            success ? 'stole' : 'gave'
          } ${count} potato${count === 1 ? '' : 's'} ${
            success ? 'from' : 'to'
          } ${who.getTag()}, ${
            success ? 'giving you a total of' : 'leaving you with'
          } ${newUserPotatos} potato${
            newUserPotatos === 1 ? '' : 's'
          }. ${discord.decor.Emojis.POTATO.repeat(newUserPotatos)} ${
            success
              ? discord.decor.Emojis.CHART_WITH_UPWARDS_TREND
              : discord.decor.Emojis.CHART_WITH_DOWNWARDS_TREND
          }`,
          color: 0x11111c
        })
      );
    }
  );

  subCommandGroup.on(
    { name: 'give', description: 'give potatos to other people' },
    (args) => ({ who: args.user(), count: args.integer() }),
    async (message, { who, count }) => {
      if (message.author?.id === who.id)
        return await message.reply("You can't give potatos to yourself!");
      const userPotatos = (await potatoKV.get<number>(message.author?.id)) || 0;
      const targetPotatos = (await potatoKV.get<number>(who.id)) || 0;

      if (count > userPotatos)
        return await message.reply(
          'You can only give as many potatos as you have!'
        );

      if (count < 1)
        return await message.reply('You need to send at least one potato.');

      const newUserPotatos = userPotatos - count;
      const newTargetPotatos = targetPotatos + count;

      await potatoKV.put(message.author?.id, newUserPotatos);
      await potatoKV.put(who.id, newTargetPotatos);

      await message.reply(
        `you gave ${count} potato${
          count === 1 ? '' : 's'
        } to ${who.getTag()}, how nice of you.`
      );
    }
  );
});
