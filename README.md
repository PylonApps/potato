# Pylon potato economy
To use this module in [Pylon](https://pylon.bot/), go to the editor, create a new file called `potato.ts`, copy the contents of this repositorys `potato.ts` into it and then put the following in your `main.ts`:
```ts
import './potato';
```

If you intend to use the potato lottery system. you also have to define a lottery channel (by its channel ID) in your `main.ts`:
```ts
global.POTATO_LOTTERY_CHANNEL = '693621234365366302';
```

# Port to slash commands
The potato economy has also been ported to slash commands, a new discord feature. If you'd rather use this version do what you would do with `potato.ts` but with `potato_slash.ts` 

**Changes**

Besides all commands being slash commands there are a few differences 

1) Potato lottery has been disabled as it was just causing trouble and Pylon cvan only have up to 10 slash commands so it had to go
2) `/potato drop` now doesn't delete the potato as Pylon can't delete a slash command response
3) `/potato` doesnt exist, to see your own potatoes uses `/potato inspect` withput providing a user

## DO NOT USE BOTH CODES!!!
